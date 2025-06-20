import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
import { UpdateUserDto } from 'src/dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(name: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      throw new ForbiddenException('user already exists');
    }

    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      throw new ForbiddenException('password is invalid');
    }

    const hash = createHash('md5').update(password).digest('hex');

    const record = {
      name: name,
      email: email,
      hash: hash,
    };

    const user = await this.prisma.user.create({
      data: record,
    });

    return {
      success: true,
      message: 'user is created',
      user: {
        id: user.id,
        name: user.name,
      },
    };
  }

  async getUser(token: string, id: number) {
    const now = new Date();

    const auth = await this.prisma.auth.findFirst({
      where: {
        token,
        expire_at: {
          gt: now,
        },
      },
    });

    if (!auth) {
      throw new ForbiddenException();
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async updateUser(token: string, dto: UpdateUserDto) {
    const now = new Date();

    const auth = await this.prisma.auth.findFirst({
      where: {
        token,
        expire_at: {
          gt: now,
        },
      },
    });

    if (!auth) {
      throw new ForbiddenException();
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: auth.user_id,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const updateData: any = { updated_at: new Date() };

    if (dto.name) {
      updateData.name = dto.name;
    }
    if (dto.email) {
      const exist = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (exist) {
        throw new ForbiddenException('email already exists');
      }
      updateData.email = dto.email;
    }
    if (dto.avatar_url) {
      updateData.avatar_url = dto.avatar_url;
    }
    if (dto.password) {
      if (!dto.currentPassword) {
        throw new BadRequestException('current password is required');
      }
      const currentHash = crypto
        .createHash('md5')
        .update(dto.currentPassword)
        .digest('hex');
      if (currentHash !== user.hash)
        throw new ForbiddenException('current password is invalid');
      updateData.hash = crypto
        .createHash('md5')
        .update(dto.password)
        .digest('hex');
    }

    const updated = await this.prisma.user.update({
      where: { id: auth.user_id },
      data: updateData,
    });

    return {
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
      },
    };
  }

  async deleteUser(token: string, password: string) {
    const now = new Date();

    const auth = await this.prisma.auth.findFirst({
      where: {
        token,
        expire_at: {
          gt: now,
        },
      },
    });

    if (!auth) {
      throw new ForbiddenException();
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: auth.user_id,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const hash = crypto.createHash('md5').update(password).digest('hex');

    if (hash !== user.hash) {
      throw new ForbiddenException('password is invalid');
    }

    await this.prisma.microPost.deleteMany({
      where: {
        user_id: user.id,
      },
    });

    await this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    await this.prisma.auth.delete({
      where: {
        user_id: user.id,
      },
    });

    return {
      success: true,
      message: 'user and all related data are deleted',
    };
  }
}
