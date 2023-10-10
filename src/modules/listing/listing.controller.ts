import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Res,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ListingService } from './listing.service';
import {
  CreateListingDto,
  ListingApplicationDto,
  ListingIdDto,
  ListingReportUpdateDto,
  UpdateListingDto,
} from './dto/listing.request';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRole } from '@prisma/client';

@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Auth()
  @Get('')
  async getListing(@Res() res: Response) {
    const data = await this.listingService.getListings();
    return res.status(200).json({ data });
  }

  @Auth([UserRole.ADMIN])
  @Post('create')
  @UseInterceptors(FilesInterceptor('upload'))
  async createListing(
    @Body() input: CreateListingDto,
    @Res() res: Response,
    @UploadedFiles() uploads: Array<Express.Multer.File>,
  ) {
    await this.listingService.createListing(input, uploads);
    return res.status(201).json({ message: 'Listing Created' });
  }

  @Auth([UserRole.ADMIN])
  @Put('update')
  @UseInterceptors(FilesInterceptor('upload'))
  async updateListing(
    @Body() input: UpdateListingDto,
    @Res() res: Response,
    @UploadedFiles() uploads: Array<Express.Multer.File>,
  ) {
    await this.listingService.updateListing(input, uploads);
    return res.status(201).json({ message: 'Listing Updated' });
  }

  @Auth([UserRole.ADMIN])
  @Delete('delete')
  async deleteListing(@Body() input: ListingIdDto, @Res() res: Response) {
    await this.listingService.deleteListing(input);
    return res.status(200).json({ message: 'Listing Deleted' });
  }

  @Auth([UserRole.VENDOR])
  @Post('apply')
  @UseInterceptors(FilesInterceptor('upload'))
  async listingApplication(
    @Body() input: ListingApplicationDto,
    @Res() res: Response,
    @Request() req,
    @UploadedFiles() uploads: Array<Express.Multer.File>,
  ) {
    await this.listingService.listingApplication(input, req.user, uploads);
    return res.status(200).json({ message: 'Application Submitted' });
  }

  @Auth([UserRole.VENDOR])
  @Post('report')
  @UseInterceptors(FilesInterceptor('upload'))
  async listingReports(
    @Body() input: ListingReportUpdateDto,
    @Res() res: Response,
    @Request() req,
    @UploadedFiles() uploads: Array<Express.Multer.File>,
  ) {
    await this.listingService.listingReport(input, req.user, uploads);
    return res.status(200).json({ message: 'Report Submitted' });
  }
}
