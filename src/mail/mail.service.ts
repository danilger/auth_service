import { Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import * as nodemailer from 'nodemailer';


@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true', // true для порта 465, false для других портов
      auth: {
        user: process.env.MAIL_USER, // ваш e-mail
        pass: process.env.MAIL_PASSWORD, // пароль от вашего e-mail
      },
    });
  }
  async send(createMailDto: CreateMailDto) {
    const { to, subject, text } = createMailDto;
    const info = await this.transporter.sendMail({
      from: `Сообщение от ${process.env.MAIL_USER}`, // адрес отправителя
      to, // список получателей
      subject, // тема письма
      text, // текст письма
      html: `<b>${text}</b>`, // html-тело
    });

    console.log('Сообщение отправлено: %s', info.messageId);
  }

}
