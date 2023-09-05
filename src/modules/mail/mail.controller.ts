import { Body, Controller, Post } from '@nestjs/common';
import { SendMailParams } from './dto/mail.request';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  sendMail(@Body() input: SendMailParams) {
    return this.mailService.sendMail(input);
  }
}
