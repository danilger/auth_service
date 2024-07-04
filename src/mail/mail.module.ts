import { Module, forwardRef } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports:[forwardRef(()=>AuthModule), PrismaModule],
  exports: [MailService]
})
export class MailModule {}
