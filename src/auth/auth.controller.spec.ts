import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    verifyOTP: jest.fn(),
    requestReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return login result', async () => {
      const email = 'test@examlpe.com';
      const password = 'secret';
      const loginResult = { user_is: 1, require_otp: true };
      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login({ email, password });

      expect(service.login).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(loginResult);
    });
  });

  describe('verifyOTP', () => {
    it('should return verification result', async () => {
      const user_id = 1;
      const otp = '123456';
      const verifyResult = { token: 'token', user_id };
      mockAuthService.verifyOTP.mockResolvedValue(verifyResult);

      const result = await controller.verifyOtp({ user_id, otp });

      expect(service.verifyOTP).toHaveBeenCalledWith(user_id, otp);
      expect(result).toEqual(verifyResult);
    });
  });

  describe('requestReset', () => {
    it('should call requestReset', async () => {
      const email = 'test@example.com';
      const resetResult = { success: true };
      mockAuthService.requestReset.mockResolvedValue(resetResult);

      const result = await controller.requestReset({ email });

      expect(service.requestReset).toHaveBeenCalledWith(email);
      expect(result).toEqual(resetResult);
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword', async () => {
      const token = 'reset-token';
      const password = 'new-password';
      const resetResult = { success: true };
      mockAuthService.resetPassword.mockResolvedValue(resetResult);

      const result = await controller.resetPassword({ token, password });

      expect(service.resetPassword).toHaveBeenCalledWith(token, password);
      expect(result).toEqual(resetResult);
    });
  });
});
