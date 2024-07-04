import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {

  constructor(private prisma: PrismaService) { }

  async create(createRoleDto: CreateRoleDto) {
    //проверка на существование роли
    const role = await this.prisma.role.findFirst({ where: { role_name: createRoleDto.role_name } });
    if (role) {
      throw new HttpException({ message: 'Role already exists' }, HttpStatus.CONFLICT);
    }
    //создаем новую роль
    return this.prisma.role.create({ data: createRoleDto });
  }

  findAll() {
    return this.prisma.role.findMany();
  }

  findOne(id: number) {
    return this.prisma.role.findUnique({ where: { id } });;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.role.update({ where: { id }, data: updateRoleDto });
  }

  remove(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }

  async setPermissions({ roleId, permissionsId }: { roleId: number, permissionsId: number[] }) {
    //проверяем роль
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new Error('Role not found');
    }
    //устанавливаем разрешения для выбраной роли
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    await this.prisma.rolePermission.createMany({
      data: permissionsId.map(permissionId => ({ roleId, permissionId })),
    });
    //проверяем установленные разрешения
    try {
      await this.prisma.rolePermission.findMany({
        where: { roleId },
        select: { permissionId: true },
      });
    } catch (error) {
      throw new HttpException({message:"Permissions not updated"}, HttpStatus.BAD_REQUEST)
    }

    return "Permissions updated"
  }
}
