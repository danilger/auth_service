import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { InitModule } from './init/init.module';

@Module({
    imports:[ConfigModule.forRoot({envFilePath: '.env'}), UserModule, PrismaModule, RoleModule, PermissionModule, AuthModule, MailModule, InitModule],
})
export class AppModule {}