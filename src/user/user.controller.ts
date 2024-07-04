import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { SetRolesDto } from './dto/set-roles.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/auth.roles.decorator';
import { Permissions } from 'src/auth/auth.permission.decorator';
import { PermissionGuard } from 'src/auth/auth.permission.guard';

@UseGuards(AuthGuard)
@UseGuards(PermissionGuard)
@Controller('user')
@ApiTags('UserService')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Roles('administrator')
  @Permissions('can_create_users')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Roles('administrator')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Roles('administrator')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
  @Roles('administrator')
  @Permissions('can_update_users')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Roles('administrator')
  @Permissions('can_delete_users')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Roles('administrator')
  @Post('set-roles')
  setRoles(@Body() setRolesDto: SetRolesDto) {
    return this.userService.setRoles(setRolesDto);
  }

  @Roles('administrator')
  @Post('delete-roles')
  deleteRoles(@Body() setRolesDto: SetRolesDto) {
    return this.userService.deleteRoles(setRolesDto);
  }
}
