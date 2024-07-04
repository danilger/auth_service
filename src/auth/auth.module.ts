import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [
        JwtModule.register({ secret: process.env.SECRET_KEY, signOptions: { expiresIn: "24h" } }),
        forwardRef(()=>UserModule),
        forwardRef(()=>MailModule),
        PrismaModule
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService,JwtModule]
})
export class AuthModule { }
