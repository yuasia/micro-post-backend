import { PostService } from './post.service';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    createPost(message: string, token: string): Promise<void>;
    getList(token: string, start: string, nr_records: string): Promise<{
        id: number;
        user_id: number;
        content: string;
        user_name: string;
        avatar_url: string;
        created_at: Date;
    }[]>;
    getSearchList(token: string, keyword: string): Promise<{
        id: number;
        user_id: number;
        content: string;
        user_name: string;
        avatar_url: string;
        created_at: Date;
    }[]>;
    getPostCount(token: string): Promise<{
        count: number;
    }>;
    deletePost(id: string, token: string): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        user_id: number;
        content: string;
    }>;
}
