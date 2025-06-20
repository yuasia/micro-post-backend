import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      const mockUser = { id: 1, name: 'John' };
      mockUserService.getUser.mockResolvedValue(mockUser);

      const result = await controller.getUser('1', 'xxx-xxx-xxx');
      expect(service.getUser).toHaveBeenCalledWith('xxx-xxx-xxx', 1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should call createUser', async () => {
      const name = 'Alice';
      const email = 'alice@example.com';
      const password = 'password123';
      mockUserService.createUser.mockResolvedValue({ id: 1 });

      const result = await controller.createUser(name, email, password);
      expect(service.createUser).toHaveBeenCalledWith(name, email, password);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('updateUser', () => {
    it('should call updateUser and return update user', async () => {
      const token = 'xxx-xxx-xxx';
      const dto = { name: 'Bob' } as any;
      const updated = { id: 1, name: 'Bob' };
      mockUserService.updateUser.mockResolvedValue(updated);

      const result = await controller.updateUser(token, dto);
      expect(service.updateUser).toHaveBeenCalledWith(token, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteUser', () => {
    it('should call deleteUser and return result', async () => {
      const token = 'xxx-xxx-xxx';
      const password = 'password123';
      const deleted = { success: true };
      mockUserService.deleteUser.mockResolvedValue(deleted);

      const result = await controller.deleteUser(token, password);
      expect(service.deleteUser).toHaveBeenCalledWith(token, password);
      expect(result).toEqual(deleted);
    });
  });
});
