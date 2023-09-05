import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { VendorService } from './vendor.service';
import { RegisterVendorDto, SendInviteLinkDto } from './dto/vendor.request.';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post('register')
  async registerVendor(@Body() input: RegisterVendorDto, @Res() res: Response) {
    await this.vendorService.registerVendor(input);
    return res.status(200).json({ message: 'Registration successful' });
  }

  @Post('invite')
  async sendVendorInviteLink(
    @Body() input: SendInviteLinkDto,
    @Res() res: Response,
  ) {
    await this.vendorService.sendVendorInviteLink(input);
    return res.status(200).json({ message: 'Invite sent' });
  }
}
