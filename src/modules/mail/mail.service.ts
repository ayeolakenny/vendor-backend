import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailParams } from './dto/mail.request';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(input: SendMailParams) {
    const { html, subject, to } = input;
    await this.mailerService.sendMail({
      to,
      html,
      subject,
    });
  }
}
