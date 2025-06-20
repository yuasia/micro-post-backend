import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';

describe('PostController', () => {
  let controller: PostController;
  let service: PostService;

  const mockPostService = {
    createPost: jest.fn(),
    getList: jest.fn(),
    getSearchList: jest.fn(),
    getPostCount: jest.fn(),
    deletePost: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getList', () => {
    it('should return a list of posts', async () => {
      const mockPostServiceList = [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
      ];
      mockPostService.getList.mockResolvedValue(mockPostServiceList);

      const result = await controller.getList('xxx-xxx-xxx', '0', '10');
      expect(service.getList).toHaveBeenCalledWith('xxx-xxx-xxx', 0, 10);
      expect(result).toEqual(mockPostServiceList);
    });
  });

  describe('createPost', () => {
    it('should call createPost', async () => {
      const message = 'Hello World';
      const token = 'xxx-xxx-xxx';

      mockPostService.createPost.mockResolvedValue({ ok: true });

      const result = await controller.createPost(message, token);
      expect(service.createPost).toHaveBeenCalledWith(message, token);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('getSearchList', () => {
    it('should return search results', async () => {
      const token = 'xxx-xxx-xxx';
      const keyword = 'Nest';
      const record = [
        { id: 1, title: 'NestJS Basics' },
        { id: 2, title: 'Advanced NestJS' },
      ];
      mockPostService.getSearchList.mockResolvedValue(record);

      const result = await controller.getSearchList(token, keyword);

      expect(service.getSearchList).toHaveBeenCalledWith(token, keyword);
      expect(result).toEqual(record);
    });
  });

  describe('getPostCount', () => {
    it('should return the post count', async () => {
      const token = 'xxx-xxx-xxx';
      mockPostService.getPostCount.mockResolvedValue(42);

      const result = await controller.getPostCount(token);

      expect(service.getPostCount).toHaveBeenCalledWith(token);
      expect(result).toEqual({ count: 42 });
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const id = '1';
      const token = 'xxx-xxx-xxx';
      const deleted = { id: 3 };
      mockPostService.deletePost.mockResolvedValue(deleted);

      const result = await controller.deletePost(id, token);

      expect(service.deletePost).toHaveBeenCalledWith(id, token);
      expect(result).toEqual(deleted);
    });
  });
});
