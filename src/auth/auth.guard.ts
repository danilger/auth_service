import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private reflect: Reflector, private authService: AuthService, private jwtService: JwtService, private prisma: PrismaService) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredRoles: string[] = this.reflect.getAllAndOverride('roles', [context.getHandler()])
    if(!requiredRoles) return true
    //получаем запрос и ответ из контекста
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    //проверяем есть ли jwt токен, если нет то возвращаем ошибку
    if (!request.headers.cookie) {
      throw new HttpException(
        { message: 'User is unauthorized' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    //верифицируем токен
    if (this.authService.verifyToken(request, response)) {
      // достаем роли из access токена
      const accessToken: string =
        request.headers.cookie
          .split(';')
          .filter((e: string) => e.includes('access_token'))[0]
          .split('=')[1] || '';
      const decodedToken: any = this.jwtService.decode(accessToken);

      // проверяем соответсвует ли полученная из токена роль, ролям из списка разрещенных
      const rolesList = await this.prisma.role.findMany() // получаем список ролей из БД
      //проверяем
      const arrayOfRequiredRolesId =  requiredRoles.map((role_name) => (rolesList.find(roleItem => roleItem.role_name == role_name))?.id||undefined)
      return this.arraysIntersect(arrayOfRequiredRolesId,decodedToken.roles)

    }
    throw new HttpException('Forbiden', HttpStatus.FORBIDDEN);
  }

  private arraysIntersect<T>(arr1: T[], arr2: T[]): boolean {
    return arr1.some(item => arr2.includes(item));
  }
}


