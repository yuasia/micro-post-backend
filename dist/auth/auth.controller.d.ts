import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        user_id: number;
        require_otp: boolean;
    }>;
    verifyOtp(body: {
        user_id: number;
        otp: string;
    }): Promise<{
        token: string;
        user_id: number;
        name: string;
        email: string;
        avatar_url: string;
    }>;
    requestReset(body: {
        email: string;
    }): Promise<void>;
    resetPassword(body: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
}
