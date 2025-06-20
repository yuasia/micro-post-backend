"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto = require("crypto");
const jwt_1 = require("@nestjs/jwt");
const sendOTPEmail_1 = require("../nodemailer/sendOTPEmail");
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const sendResetPasswordEmail_1 = require("../nodemailer/sendResetPasswordEmail");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user ||
            user.hash !== crypto.createHash('md5').update(password).digest('hex')) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const otp = this.generateOtp();
        const otp_expire_at = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.user.update({
            where: { email },
            data: { otp, otp_expire_at },
        });
        await (0, sendOTPEmail_1.sendOTPEmail)(email, otp);
        return { user_id: user.id, require_otp: true };
    }
    async verifyOTP(user_id, otp) {
        const user = await this.prisma.user.findUnique({ where: { id: user_id } });
        if (!user || !user.otp_expire_at) {
            throw new common_1.UnauthorizedException();
        }
        if (user.otp !== otp || user.otp_expire_at < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
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
        }
        else {
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
    async requestReset(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
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
        await (0, sendResetPasswordEmail_1.sendResetPasswordEmail)(email, token);
    }
    async resetPassword(token, password) {
        const payload = this.jwtService.verify(token);
        if (payload.type !== 'password_reset') {
            throw new common_1.ForbiddenException('Invalid token type');
        }
        const record = await this.prisma.passwordReset.findUnique({
            where: { token: token },
        });
        if (!record || record.expire_at < new Date()) {
            throw new common_1.ForbiddenException('Invalid or expired reset token');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map