import {
  Controller,
  Post,
  Body,
  Res,
  UploadedFiles,
  UseInterceptors,
  Get,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { VendorService } from './vendor.service';
import {
  RegisterVendorDto,
  SendInviteLinkDto,
  VendorIdDto,
} from './dto/vendor.request.';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRole } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  async getVendors() {
    return await this.vendorService.getVendors();
  }

  @Get(':id')
  async getOneVendor(@Param('id') id: string) {
    return await this.vendorService.getOneVendor(+id);
  }

  @Post('register')
  @UseInterceptors(FilesInterceptor('upload'))
  async registerVendor(
    @Body() input: RegisterVendorDto,
    @Res() res: Response,
    @UploadedFiles() uploads: Array<Express.Multer.File>,
  ) {
    await this.vendorService.registerVendor(input, uploads);
    return res.status(200).json({ message: 'Registration successful' });
  }

  @Auth([UserRole.ADMIN])
  @Post('invite')
  async sendVendorInviteLink(
    @Body() input: SendInviteLinkDto,
    @Res() res: Response,
  ) {
    await this.vendorService.sendVendorInviteLink(input);
    return res.status(200).json({ message: 'Invite sent' });
  }

  @Auth([UserRole.ADMIN])
  @Post('approve')
  async approveVendor(@Body() input: VendorIdDto, @Res() res: Response) {
    await this.vendorService.approveVendor(input);
    return res.status(200).json({ message: 'Vendor approved' });
  }

  @Auth([UserRole.ADMIN])
  @Post('decline')
  async declineVendor(@Body() input: VendorIdDto, @Res() res: Response) {
    await this.vendorService.declineVendor(input);
    return res.status(200).json({ message: 'Vendor declined' });
  }

  @Auth([UserRole.ADMIN])
  @Post('deactivate')
  async deleteVendor(@Body() input: VendorIdDto, @Res() res: Response) {
    await this.vendorService.deactivateVendor(input);
    return res.status(200).json({ message: 'Vendor deactivated' });
  }
}
