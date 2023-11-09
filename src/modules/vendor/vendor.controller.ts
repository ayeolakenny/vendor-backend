import {
  Controller,
  Post,
  Body,
  Res,
  UploadedFiles,
  UseInterceptors,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { VendorService } from './vendor.service';
import {
  RegisterVendorDto,
  SendInviteLinkDto,
  statusUpdateDto,
} from './dto/vendor.request';
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

  /**
   * Update the registration status of a vendor.
   *
   * @param {statusUpdateDto} input - The data for updating the vendor's registration status.
   * @param {Response} res - Express response object.
   * @returns {Promise<any>} - A promise that resolves with a JSON response indicating the result of the operation.
   *
   * @throws {UnauthorizedException} - If the user does not have the required role (ADMIN) to perform this action.
   */
  @Auth([UserRole.ADMIN])
  @Put('review')
  async reviewRegistration(
    @Body() input: statusUpdateDto,
    @Res() res: Response,
  ): Promise<any> {
    await this.vendorService.reviewVendorRegistration(input);
    return res
      .status(200)
      .json({ message: `Vendor status updated to ${input.status}` });
  }

  /**
   * Retrieve all applications by a single vendor.
   * @param {string} vendorId - The unique identifier of the vendor.
   * @returns {Promise<any>} A promise that resolves to the list of applications.
   */
  @Auth()
  @Get('applications/:vendorId')
  async allVendorApplications(
    @Param('vendorId') vendorId: string,
  ): Promise<any> {
    return await this.vendorService.getAllApplicationsBySingleVendor(vendorId);
  }
}
