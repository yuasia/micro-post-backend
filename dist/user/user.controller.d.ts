import { UserService } from './user.service';
import { UpdateUserDto } from 'src/dto/user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(name: string, email: string, password: string): Promise<{
        success: boolean;
        message: string;
        user: {
            id: number;
            name: string;
        };
    }>;
    updateUser(token: string, dto: UpdateUserDto): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    getUser(id: string, token: string): Promise<{
        name: string;
        email: string;
        avatar_url: string;
        id: number;
        hash: string;
        otp: string | null;
        otp_expire_at: Date | null;
        created_at: Date;
        updated_at: Date;
    }>;
    deleteUser(token: string, password: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
