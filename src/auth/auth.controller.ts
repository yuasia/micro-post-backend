import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return await this.authService.login(body.email, body.password);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { user_id: number; otp: string }) {
    return await this.authService.verifyOTP(body.user_id, body.otp);
  }

  @Post('request-reset')
  async requestReset(@Body() body: { email: string }) {
    return await this.authService.requestReset(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return await this.authService.resetPassword(body.token, body.password);
  }
}
