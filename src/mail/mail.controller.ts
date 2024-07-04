import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/auth.roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('MailService')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) { }

  @UseGuards(AuthGuard)
  @Roles('administrator')
  @Post()
  send(@Body() createMailDto: CreateMailDto) {
    return this.mailService.send(createMailDto);
  }

}
