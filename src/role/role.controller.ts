import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { SetPermissionsToRoleDto, UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/auth.roles.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@ApiTags('RoleService')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }


  @Roles('administrator')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Roles('administrator')
  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Roles('administrator')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Roles('administrator')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Roles('administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }

  @Roles('administrator')
  @Post('set-permissions')
  setPermissions(@Body() permissions:SetPermissionsToRoleDto ) {
    return this.roleService.setPermissions(permissions); 
    }
  }
