import { PrismaService } from 'src/prisma/prisma.service';
export declare class PostService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createPost(message: string, token: string): Promise<void>;
    getList(token: string, start: number, nr_records: number): Promise<{
        id: number;
        user_id: number;
        content: string;
        user_name: string;
        avatar_url: string;
        created_at: Date;
    }[]>;
    getSearchList(token: string, search: string): Promise<{
        id: number;
        user_id: number;
        content: string;
        user_name: string;
        avatar_url: string;
        created_at: Date;
    }[]>;
    getPostCount(token: string): Promise<number>;
    deletePost(id: string, token: string): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        user_id: number;
        content: string;
    }>;
}
