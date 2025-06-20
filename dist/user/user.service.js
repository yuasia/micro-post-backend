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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(name, email, password) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (existingUser) {
            throw new common_1.ForbiddenException('user already exists');
        }
        if (password.length < 8 ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password)) {
            throw new common_1.ForbiddenException('password is invalid');
        }
        const hash = (0, crypto_1.createHash)('md5').update(password).digest('hex');
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
    async getUser(token, id) {
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
            throw new common_1.ForbiddenException();
        }
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException();
        }
        return user;
    }
    async updateUser(token, dto) {
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
            throw new common_1.ForbiddenException();
        }
        const user = await this.prisma.user.findUnique({
            where: {
                id: auth.user_id,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException();
        }
        const updateData = { updated_at: new Date() };
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
                throw new common_1.ForbiddenException('email already exists');
            }
            updateData.email = dto.email;
        }
        if (dto.avatar_url) {
            updateData.avatar_url = dto.avatar_url;
        }
        if (dto.password) {
            if (!dto.currentPassword) {
                throw new common_1.BadRequestException('current password is required');
            }
            const currentHash = crypto
                .createHash('md5')
                .update(dto.currentPassword)
                .digest('hex');
            if (currentHash !== user.hash)
                throw new common_1.ForbiddenException('current password is invalid');
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
    async deleteUser(token, password) {
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
            throw new common_1.ForbiddenException();
        }
        const user = await this.prisma.user.findFirst({
            where: {
                id: auth.user_id,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException();
        }
        const hash = crypto.createHash('md5').update(password).digest('hex');
        if (hash !== user.hash) {
            throw new common_1.ForbiddenException('password is invalid');
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
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map