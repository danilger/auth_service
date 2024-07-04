import { Module } from '@nestjs/common';
import { InitService } from './init.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [InitService],
  imports: [PrismaModule]
})
export class InitModule {}
