import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    private generateOtp;
    login(email: string, password: string): Promise<{
        user_id: number;
        require_otp: boolean;
    }>;
    verifyOTP(user_id: number, otp: string): Promise<{
        token: string;
        user_id: number;
        name: string;
        email: string;
        avatar_url: string;
    }>;
    requestReset(email: string): Promise<void>;
    resetPassword(token: string, password: string): Promise<{
        message: string;
    }>;
}
