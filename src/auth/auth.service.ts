import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/LoginUser.dto';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs'
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';



@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    private prisma: PrismaService,
  ) { }
  async login(loginUserDto: LoginUserDto, response: Response) {
    const user = await this.validateUser(loginUserDto);
    const userFromDB = await this.userService.getUserById(user.id);
    const dataToken = await this.generateToken(userFromDB);

    response.cookie('refresh_token', dataToken.token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });

    response.cookie('access_token', dataToken.token, {
      httpOnly: false,
      maxAge: 1000 * 60 * 15,
    });

    response.status(200).send(dataToken);
  }

  async registration(createUserDto: CreateUserDto) {
    // Проверка пользователя
    const candidate = await this.userService.getUserByEmail(createUserDto.email)

    if (candidate) {
      throw new HttpException({ message: "User already exists" }, HttpStatus.BAD_REQUEST)
    }

    const hashPassword: string = await bcrypt.hash(createUserDto.password, 5)

    // создаем нового пользователя
    const user = await this.userService.create({ ...createUserDto, password: hashPassword })

    //Отправка ссылки для подтверждения создания пользователя
    const token = this.jwtService.sign({ id: user.id, type: 'email_confirmation' });
    this.mailService.send({
      to: user.email,
      subject: 'Подтверждение email',
      text: `Ссылка для подтверждения пароля ${process.env.HOST}:${process.env.PORT}/auth/confirmation/${token}`
    }
    );

    return {
      message: 'На вашу почту отправлена ссылка для подтверждения email.',
    };
  }

  async changePassword(updateUserDto: UpdateUserDto) {
    const { name = '', email = '', resetpassword } = updateUserDto

    // Валидация запроса
    if (!resetpassword) throw new HttpException({ message: 'Reset passowrd required' }, HttpStatus.BAD_REQUEST)
    const user = await this.prisma.user.findFirst({ where: { OR: [{ name }, { email }] } })
    if (!user) throw new HttpException({ message: 'User not found' }, HttpStatus.BAD_REQUEST)

    // шифруем новый пароль
    const hashPassword: string = await bcrypt.hash(resetpassword, 5)

    // сохранить новый пароль в reset_password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetpassword: hashPassword },
    })

    //Отправка ссылки для подтверждения создания пользователя
    const token = this.jwtService.sign({ id: user.id, type: "reset_password" });
    this.mailService.send({
      to: user.email,
      subject: 'Подтверждение email',
      text: `Ссылка для подтверждения смены пароля ${process.env.HOST}:${process.env.PORT}/auth/confirmation/${token}`
    }

    );
    return {
      message: 'На вашу почту отправлена ссылка для подтверждения смены пароля.',
    };
  }

  async confirmByEmail(token: string) {
    let decodedToken: { id: number; type: string };

    try {
      decodedToken = this.jwtService.verify(token);
    } catch (error) {
      throw new HttpException(error, HttpStatus.FORBIDDEN);
    }

    if (!decodedToken || !decodedToken.id || !decodedToken.type) {
      throw new HttpException({ message: 'Invalid token format' }, HttpStatus.BAD_REQUEST);
    }

    const { id, type } = decodedToken;

    switch (type) {
      case 'email_confirmation':
        try {
          await this.prisma.user.update({
            where: { id },
            data: { is_activated: true },
          });
          return { message: 'Email подтвержден.', id };
        } catch (error) {
          throw new HttpException('Ошибка подтверждения email.', HttpStatus.BAD_REQUEST);
        }
      case 'reset_password':
        try {
          const user = await this.prisma.user.findFirst({ where: { id } });
          if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
          }
          await this.prisma.user.update({
            where: { id },
            data: { password: user.resetpassword },
          });
          return { message: 'Пароль изменен.' };
        } catch (error) {
          throw new HttpException('Ошибка изменения пароля.', HttpStatus.BAD_REQUEST);
        }
      default:
        throw new HttpException('Invalid token type', HttpStatus.BAD_REQUEST);
    }
  }

  private async validateUser(loginUserDto: LoginUserDto) {
    const user = await this.userService.getUserByEmail(loginUserDto.email);

    const passCheck = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (user && passCheck) {
      if (!user.is_activated) {
        throw new HttpException('Email не подтвержден.', HttpStatus.FORBIDDEN);;
      }
      return user;
    }
    throw new HttpException(
      'Не корректный пароль или email',
      HttpStatus.UNAUTHORIZED,
    );
  }
  
  private async generateToken(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map(r => r.roleId)
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  verifyToken(request: Request, response: Response) {
    //если запрос не содержит токен авторизации возвращаем ошибку
    if (!request.headers.cookie) {
      return false;
    }

    //если запрос содержит access токен авторизации проверяем его
    if (request.headers.cookie?.includes('access_token')) {
      const accesstToken: string =
        request.headers.cookie
          .split(';')
          .filter((e: string) => e.includes('access_token'))[0]
          .split('=')[1] || '';

      try {
        const user = this.jwtService.verify(accesstToken);

        if (user.is_activated) {
          return true;
        } else if (user.is_activated === false) {
          throw new HttpException(
            { message: 'It is necessary to activate the user account' },
            HttpStatus.UNAUTHORIZED,
          );
        }
      } catch (e) {
        throw new HttpException(
          { message: 'Error access token verification failed - ' + e.message },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (request.headers.cookie?.includes('refresh_token')) {
      const refreshToken: string =
        request.headers.cookie
          .split(';')
          .filter((e: string) => e.includes('refresh_token'))[0]
          .split('=')[1] || '';

      if (this.jwtService.verify(refreshToken)) {
        response.cookie('access_token', refreshToken, {
          httpOnly: false,
          maxAge: 1000 * 60 * 15,
        });
        return true;
      } else { throw new HttpException({ message: "Error refrersh token verification failed" }, HttpStatus.BAD_REQUEST); }
    }

    return false;
  }
}
