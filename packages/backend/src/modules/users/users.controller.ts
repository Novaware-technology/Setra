import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/core/decorators/roles/roles.decorator';
import { RolesGuard } from 'src/core/guards/roles/roles.guard';
import { CurrentUser } from 'src/core/decorators/current-user/current-user.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // @Roles('admin', 'support')
  // @UseGuards(RolesGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('admin', 'support')
  @UseGuards(RolesGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  findMySelf(@CurrentUser() user: any) {
    return this.usersService.findMySelf(user);
  }

  @Get(':id')
  @Roles('admin', 'support')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: any) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @Roles('admin', 'support')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.usersService.remove(id, currentUser);
  }
}
