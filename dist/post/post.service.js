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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PostService = class PostService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPost(message, token) {
        const now = new Date();
        const auth = await this.prisma.auth.findFirst({
            where: {
                token: token,
                expire_at: {
                    gte: now,
                },
            },
        });
        if (!auth) {
            throw new common_1.ForbiddenException();
        }
        const record = {
            user_id: auth.user_id,
            content: message,
        };
        await this.prisma.microPost.create({ data: record });
    }
    async getList(token, start, nr_records) {
        const now = new Date();
        const auth = await this.prisma.auth.findFirst({
            where: {
                token: token,
                expire_at: {
                    gte: now,
                },
            },
        });
        if (!auth) {
            throw new common_1.ForbiddenException();
        }
        const qb = await this.prisma.microPost.findMany({
            orderBy: {
                created_at: 'desc',
            },
            skip: start,
            take: nr_records,
            include: {
                user: {
                    select: {
                        name: true,
                        avatar_url: true,
                    },
                },
            },
        });
        const records = qb.map((post) => {
            return {
                id: post.id,
                user_id: post.user_id,
                content: post.content,
                user_name: post.user.name,
                avatar_url: post.user.avatar_url,
                created_at: post.created_at,
            };
        });
        return records;
    }
    async getSearchList(token, search) {
        const now = new Date();
        const auth = await this.prisma.auth.findUnique({
            where: {
                token: token,
                expire_at: {
                    gte: now,
                },
            },
        });
        if (!auth) {
            throw new common_1.ForbiddenException();
        }
        const qb = await this.prisma.microPost.findMany({
            where: {
                content: {
                    contains: search,
                    mode: 'insensitive',
                },
            },
            orderBy: {
                created_at: 'desc',
            },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar_url: true,
                    },
                },
            },
        });
        const records = qb.map((post) => {
            return {
                id: post.id,
                user_id: post.user_id,
                content: post.content,
                user_name: post.user.name,
                avatar_url: post.user.avatar_url,
                created_at: post.created_at,
            };
        });
        return records;
    }
    async getPostCount(token) {
        const now = new Date();
        const auth = await this.prisma.auth.findUnique({
            where: {
                token: token,
                expire_at: {
                    gte: now,
                },
            },
        });
        if (!auth) {
            throw new common_1.ForbiddenException();
        }
        const count = await this.prisma.microPost.count();
        return count;
    }
    async deletePost(id, token) {
        const now = new Date();
        const auth = await this.prisma.auth.findUnique({
            where: {
                token: token,
                expire_at: {
                    gte: now,
                },
            },
        });
        if (!auth) {
            throw new common_1.ForbiddenException();
        }
        const post = await this.prisma.microPost.findUnique({
            where: {
                id: parseInt(id, 10),
            },
        });
        if (!post || post.user_id !== auth.user_id) {
            throw new common_1.ForbiddenException('You are not authorized to delete this post');
        }
        return await this.prisma.microPost.delete({
            where: {
                id: parseInt(id, 10),
            },
        });
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostService);
//# sourceMappingURL=post.service.js.map