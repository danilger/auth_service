import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private prisma: PrismaService, private reflect: Reflector, private authService: AuthService, private jwtService: JwtService) { }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const requiredPermissions: string[] = this.reflect.getAllAndOverride('permissions', [context.getHandler()])

        if (!requiredPermissions) return true;
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

            const { rolesId }: { rolesId: number[] } = this.jwtService.decode(accessToken);
            const permissionNames = await this.getPermissionsForRoles(rolesId)
            return this.arraysIntersect(permissionNames, requiredPermissions)

        }

        throw new HttpException('Forbiden', HttpStatus.FORBIDDEN);
    }

    async getPermissionsForRoles(roleIds: number[]): Promise<string[]> {
        const rolesWithPermissions = await this.prisma.role.findMany({
            where: {
                id: {
                    in: roleIds,
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        // Извлекаем имена разрешений из полученных данных
        const permissionNames = rolesWithPermissions.flatMap(role =>
            role.permissions.map(rp => rp.permission.permission_name)
        );

        // Удаляем дубликаты, если необходимо
        const uniquePermissionNames = Array.from(new Set(permissionNames));

        return uniquePermissionNames;
    }

    private arraysIntersect<T>(arr1: T[], arr2: T[]): boolean {
        return arr1.some(item => arr2.includes(item));
    }
}