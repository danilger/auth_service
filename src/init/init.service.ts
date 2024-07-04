import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class InitService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.initRoles();
        await this.initAdminUser();
        await this.initPermissions();
    }

    // При первой загрузке проверяем есть ли в БД роли, если нет, то создаем роли admin и user
    async initRoles() {

        const existingRoles = await this.prisma.role.findMany({
            where: {
                OR: [
                    { role_name: 'admin' },
                    { role_name: 'user' }
                ]
            }
        });

        if (existingRoles.length == 0) {
            try {
                await this.prisma.role.createMany(
                    {
                        data: [
                            { role_name: 'admin' },
                            { role_name: 'user' },
                        ],
                    }
                )
                console.log('Initial roles created.');
            } catch (e) { console.error(e) }


        }
    }

    // При первой загрузке проверяем есть ли в БД пользователи, если нет, то создаем администратора и назначем ему роль admin
    async initAdminUser() {
        const users = await this.prisma.user.findMany()
        if (users.length === 0) {
            try {
                // шифруем новый пароль
                const hashPassword: string = await bcrypt.hash('admin', 5)
                const userAdmin = await this.prisma.user.create({
                    data: {
                        email: 'admin', // устанавливаем дефолтный пароль
                        password: hashPassword,
                        is_activated: true,
                        resetpassword: null,
                        activation_link: null,
                    }
                })
                // получаем роль admin из БД
                const adminRole = await this.prisma.role.findFirst({
                    where: { role_name: 'admin' }
                })
                // назначаем роль admin пользователю userAdmin
                await this.prisma.userRole.create({ data: { userId: userAdmin.id, roleId: adminRole.id } })
                console.log('User Admin created.');
            } catch (e) { console.error(e) }

        }
    }

    // Создаем права при первой загрузке и устанавляваем их для пользователя admin
    async initPermissions() {
        // проверяем есть ли права, если таблица пустая, то создаем базовый набор прав
        const permissions = await this.prisma.permission.findMany()
        if (permissions.length === 0) {
            try {
                await this.prisma.permission.createMany(
                    {
                        data: [
                            { permission_name: 'can_create_users', permission_description: 'Может создавать пользователя' },
                            { permission_name: 'can_update_users', permission_description: 'Может редактировать пользователя' },
                            { permission_name: 'can_delete_users', permission_description: 'Может удалять пользователя' },
                            { permission_name: 'can_read_users', permission_description: 'Может просматривать пользователя' },

                            { permission_name: 'can_create_roles', permission_description: 'Может создавать роль' },
                            { permission_name: 'can_update_roles', permission_description: 'Может редактировать роль' },
                            { permission_name: 'can_delete_roles', permission_description: 'Может удалять роль' },
                            { permission_name: 'can_read_roles', permission_description: 'Может просматривать роль' },

                            { permission_name: 'can_create_permission', permission_description: 'Может создавать права' },
                            { permission_name: 'can_update_permission', permission_description: 'Может редактировать права' },
                            { permission_name: 'can_delete_permission', permission_description: 'Может удалять права' },
                            { permission_name: 'can_read_permission', permission_description: 'Может просматривать права' },
                        ],
                    }
                )
                console.log('Initial permissions created.');
                // находим в БД роль admin
                const adminRole = await this.prisma.role.findFirst({
                    where: { role_name: 'admin' }
                })
                // находим в БД все права
                const allPermissions = await this.prisma.permission.findMany()

                // назначаем права admin роли admin
                await Promise.all(allPermissions.map(permission => this.prisma.rolePermission.create({
                    data: {
                        roleId: adminRole.id,
                        permissionId: permission.id,
                    }
                })))
               console.log('Permissions assigned to admin.')
            }
            catch (e) { console.error(e) }
        }
    }


}
