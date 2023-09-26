import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
// import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_ID, // generated ethereal user
          pass: process.env.EMAIL_PASS, // generated ethereal password
        },
      },
    }),
  ],
  // controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
