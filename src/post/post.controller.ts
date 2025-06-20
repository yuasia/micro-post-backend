import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async createPost(
    @Body('message') message: string,
    @Query('token') token: string,
  ) {
    return await this.postService.createPost(message, token);
  }

  @Get()
  async getList(
    @Query('token') token: string,
    @Query('start') start: string,
    @Query('records') nr_records: string,
  ) {
    const numRecords = parseInt(nr_records, 10) || 1;
    const startIndex = parseInt(start, 10) || 0;
    return await this.postService.getList(token, startIndex, numRecords);
  }

  @Get('search')
  async getSearchList(
    @Query('token') token: string,
    @Query('keyword') keyword: string,
  ) {
    return await this.postService.getSearchList(token, keyword);
  }

  @Get('count')
  async getPostCount(@Query('token') token: string) {
    const count = await this.postService.getPostCount(token);
    return { count };
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string, @Query('token') token: string) {
    return await this.postService.deletePost(id, token);
  }
}
