import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionService {

  constructor(private prisma:PrismaService) {}

  create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({data: createPermissionDto});
  }

  findAll() {
    return  this.prisma.permission.findMany();
  }

  findOne(id: number) {
    return this.prisma.permission.findUnique({where:{id}});;
  }

  update(id: number, updateUserDto: UpdatePermissionDto) {
    return this.prisma.permission.update({where:{id},data:updateUserDto});
  }

  remove(id: number) {
    return this.prisma.permission.delete({where:{id}});
  }
}
