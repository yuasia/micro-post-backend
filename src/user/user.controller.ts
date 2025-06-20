import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from 'src/dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.userService.createUser(name, email, password);
  }

  @Post('update')
  async updateUser(@Body('token') token: string, @Body() dto: UpdateUserDto) {
    return await this.userService.updateUser(token, dto);
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @Query('token') token: string) {
    const user_id = parseInt(id, 10);
    return await this.userService.getUser(token, user_id);
  }

  @Post('delete')
  async deleteUser(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return await this.userService.deleteUser(token, password);
  }
}
