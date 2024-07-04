import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/LoginUser.dto';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@ApiTags('AuthService')
@Controller('auth')
export class AuthController {
  constructor(private authSevice: AuthService) { }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto, @Res() response: Response) {
    return this.authSevice.login(loginUserDto, response);
  }

  @Post('registration')
  registration(@Body() createUserDto: CreateUserDto) {
    return this.authSevice.registration(createUserDto);
  }

  @Patch('change_password')
  changePassword(@Body() updateUserDto: UpdateUserDto) {
    return this.authSevice.changePassword(updateUserDto);
  }

  @Get('confirmation/:value')
  async confirmation(@Param('value') token: string) {
    return this.authSevice.confirmByEmail(token);
  }
}
