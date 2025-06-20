import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from 'src/dto/user.dto';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createUser(name: string, email: string, password: string): Promise<{
        success: boolean;
        message: string;
        user: {
            id: number;
            name: string;
        };
    }>;
    getUser(token: string, id: number): Promise<{
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
    updateUser(token: string, dto: UpdateUserDto): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    deleteUser(token: string, password: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
