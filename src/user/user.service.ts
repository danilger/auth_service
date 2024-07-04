import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SetRolesDto } from './dto/set-roles.dto';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const userFromDb = await this.getUserByEmail(createUserDto.email)
    if (userFromDb) { throw new HttpException({ message: "User already exists" }, HttpStatus.BAD_REQUEST) }
    const newUser = await this.prisma.user.create({ data: createUserDto })
    // Удаляем скрытые и ненужные свойства для отображения
    delete newUser.password;
    delete newUser.is_activated;
    delete newUser.resetpassword;
    delete newUser.activation_link;
    return newUser
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });

  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const hashPassword: string = await bcrypt.hash(updateUserDto.password, 5)
    return this.prisma.user.update({ where: { id }, data: { ...updateUserDto, password: hashPassword } });
  }

  async remove(id: number) {
    try {
      const deletedUser = await this.prisma.user.delete({ where: { id } });
      return `Пользователь с id ${deletedUser.id} удален.`;

    } catch {
      throw new HttpException({ message: "User not found" }, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  getUserById(id: number) {
    return this.prisma.user.findUnique({ where: { id }, include: { roles: true } });
  }

  async setRoles(setRole: SetRolesDto) {
    const { userId, rolesId } = setRole;

    // Найти пользователя, если его нет, то вернуть ошибку
    const userFromDb = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userFromDb) throw new HttpException({ message: "User not found" }, HttpStatus.BAD_REQUEST);

    // Создать цикл по ролям из rolesId
    for (const roleId of rolesId) {
      // Найти роль, если ее нет, то идем к следующей роли
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });

      // Найти связь пользователь-роль, если она есть, то идем к следующей роли
      const userRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: userId,
            roleId: roleId,
          },
        },
      });

      if (role && !userRole) {
        // Присвоить пользователю роль
        await this.prisma.userRole.create({ data: { userId, roleId } });
      }
    }

    // Вернуть пользователя с новыми ролями
    const userWithRoles = await this.prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
    const rolesList = await this.prisma.role.findMany()

    // Извлечь названия ролей
    const roles = userWithRoles.roles.map(({ roleId }) => (rolesList.find(r => r.id === roleId)).role_name);

    // Вернуть пользователя с массивом названий ролей
    return {
      ...userWithRoles,
      roles,
    };
  }

  async deleteRoles(setRole: SetRolesDto) {
    const { userId, rolesId } = setRole;

    // Найти пользователя, если его нет, то вернуть ошибку
    const userFromDb = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userFromDb) throw new HttpException({ message: "User not found" }, HttpStatus.BAD_REQUEST);

    // Создать цикл по ролям из rolesId
    for (const roleId of rolesId) {

      // Найти связь пользователь-роль, если она есть, то удаляем ее
      const userRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: userId,
            roleId: roleId,
          },
        },
      });

      // Удалить роль у пользователя
      if (userRole) await this.prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId: userId,
            roleId: roleId,
          }
        }
      });
    }

    // Вернуть пользователя с новыми ролями
    const userWithRoles = await this.prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
    const rolesList = await this.prisma.role.findMany()

    // Извлечь названия ролей
    const roles = userWithRoles.roles.map(({ roleId }) => (rolesList.find(r => r.id === roleId)).role_name);

    // Вернуть пользователя с массивом названий ролей
    return {
      ...userWithRoles,
      roles,
    };
  }

}
