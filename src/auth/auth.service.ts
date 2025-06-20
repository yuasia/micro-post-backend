import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { sendOTPEmail } from '../nodemailer/sendOTPEmail';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { sendResetPasswordEmail } from 'src/nodemailer/sendResetPasswordEmail';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      user.hash !== crypto.createHash('md5').update(password).digest('hex')
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const otp = this.generateOtp();
    const otp_expire_at = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { otp, otp_expire_at },
    });

    await sendOTPEmail(email, otp);

    return { user_id: user.id, require_otp: true };
  }

  async verifyOTP(user_id: number, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { id: user_id } });

    if (!user || !user.otp_expire_at) {
      throw new UnauthorizedException();
    }

    if (user.otp !== otp || user.otp_expire_at < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.user.update({
      where: { id: user_id },
      data: { otp: null, otp_expire_at: null },
    });

    const ret = {
      token: '',
      user_id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
    };

    var expire = new Date();
    expire.setDate(expire.getDate() + 1);

    const auth = await this.prisma.auth.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (auth) {
      const updated = await this.prisma.auth.update({
        where: {
          id: auth.id,
        },
        data: {
          expire_at: expire,
        },
      });
      ret.token = updated.token;
    } else {
      const payload = { sub: user.id.toString(), type: 'auth' };
      const token = this.jwtService.sign(payload, {
        expiresIn: '1d',
      });
      const created = await this.prisma.auth.create({
        data: {
          user_id: user.id,
          token,
          expire_at: expire,
        },
      });
      ret.token = created.token;
    }

    return ret;
  }

  async requestReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const expire_at = new Date(Date.now() + 1000 * 60 * 10);

    const jwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      type: 'password_reset',
      exp: Math.floor(expire_at.getTime() / 1000),
    };

    const token = this.jwtService.sign(jwtPayload);

    await this.prisma.passwordReset.deleteMany({
      where: { user_id: user.id },
    });

    await this.prisma.passwordReset.create({
      data: {
        user_id: user.id,
        token: token,
        expire_at: expire_at,
      },
    });

    await sendResetPasswordEmail(email, token);
  }

  async resetPassword(token: string, password: string) {
    const payload = this.jwtService.verify(token);

    if (payload.type !== 'password_reset') {
      throw new ForbiddenException('Invalid token type');
    }

    const record = await this.prisma.passwordReset.findUnique({
      where: { token: token },
    });

    if (!record || record.expire_at < new Date()) {
      throw new ForbiddenException('Invalid or expired reset token');
    }

    const hash = crypto.createHash('md5').update(password).digest('hex');

    await this.prisma.user.update({
      where: { id: record.user_id },
      data: { hash: hash },
    });

    await this.prisma.passwordReset.delete({
      where: { token: token },
    });

    return { message: 'Password reset successfully' };
  }
}
