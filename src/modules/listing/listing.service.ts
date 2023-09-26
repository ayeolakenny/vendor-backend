import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateListingDto,
  ListingApplicationDto,
  ListingIdDto,
  ListingReportUpdateDto,
  UpdateListingDto,
} from './dto/listing.request';
import { Listing, Status } from '@prisma/client';
import { AuthPayload } from 'src/constants/types';

@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService) {}

  async createListing(input: CreateListingDto, uploads: Express.Multer.File[]) {
    const { categoryId, description, name, vendors } = input;

    const newListing =
      vendors && vendors.length > 0
        ? await this.prisma.listing.create({
            data: {
              name,
              description,
              category: { connect: { id: +categoryId } },
              vendors: {
                connect: vendors.map((vendorId) => ({ id: +vendorId })),
              },
            },
          })
        : await this.prisma.listing.create({
            data: {
              name,
              description,
              category: { connect: { id: +categoryId } },
            },
          });

    if (uploads && newListing) {
      const listingUploads = [];

      uploads.forEach(async (upload) => {
        listingUploads.push({
          name: upload.originalname,
          size: upload.size,
          type: upload.mimetype,
          bytes: upload.buffer,
          listingId: newListing.id,
        });
      });

      await this.prisma.upload.createMany({
        data: listingUploads,
      });
    }

    return true;
  }

  async getListings() {
    return await this.prisma.listing.findMany({
      include: {
        category: true,
        vendors: true,
        upload: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async updateListing(input: UpdateListingDto, uploads: Express.Multer.File[]) {
    const { id, categoryId, description, name, vendors } = input;

    const listing = await this.prisma.listing.findUnique({
      where: { id: +id },
    });

    if (!listing) throw new BadRequestException('Listing does not exist');

    let newListing: Listing;

    if (vendors && vendors.length > 0) {
      await this.prisma.listing.update({
        where: { id: +id },
        data: {
          vendors: {
            set: [],
          },
        },
      });

      newListing = await this.prisma.listing.update({
        where: { id: +id },
        data: {
          name,
          description,
          category: { connect: { id: +categoryId } },
          vendors: {
            connect: vendors.map((vendorId) => ({ id: +vendorId })),
          },
        },
      });

      await this.prisma.$transaction([]);
    } else if (!vendors) {
      newListing = await this.prisma.listing.update({
        where: { id: +id },
        data: {
          name,
          description,
          category: { connect: { id: +categoryId } },
          vendors: {
            set: [],
          },
        },
      });
    }

    if (uploads && newListing) {
      await this.prisma.upload.deleteMany({
        where: { listingId: +id },
      });

      const listingUploads = [];

      uploads.forEach(async (upload) => {
        listingUploads.push({
          name: upload.originalname,
          size: upload.size,
          type: upload.mimetype,
          bytes: upload.buffer,
          listingId: newListing.id,
        });
      });

      await this.prisma.upload.createMany({
        data: listingUploads,
      });
    } else if (!uploads && uploads.length <= 0) {
      await this.prisma.upload.deleteMany({
        where: { listingId: +id },
      });
    }

    return true;
  }

  async deleteListing(input: ListingIdDto) {
    const { id } = input;
    const listing = await this.prisma.listing.findUnique({
      where: { id: +id },
    });

    if (!listing) throw new NotFoundException('Listing does not exist');

    await this.prisma.listing.delete({ where: { id: +id } });
    return true;
  }

  async listingApplication(
    input: ListingApplicationDto,
    user: AuthPayload,
    uploads: Express.Multer.File[],
  ) {
    const vendorId = user.vendorId;
    const { listingId, comment } = input;
    await this.__checkIfListingExist(+listingId);

    const application = await this.prisma.application.create({
      data: {
        listing: { connect: { id: +listingId } },
        vendor: { connect: { id: +vendorId } },
        comment,
      },
    });

    if (uploads && application) {
      const applicationUploads = [];

      uploads.forEach(async (upload) => {
        applicationUploads.push({
          name: upload.originalname,
          size: upload.size,
          type: upload.mimetype,
          bytes: upload.buffer,
          applicationId: application.id,
        });
      });

      await this.prisma.upload.createMany({
        data: applicationUploads,
      });
    }

    return true;
  }

  async listingReport(
    input: ListingReportUpdateDto,
    user: AuthPayload,
    uploads: Express.Multer.File[],
  ) {
    const { comment, listingId, applicationId } = input;
    const vendorId = user.vendorId;

    const listing = await this.__checkIfListingExist(+listingId);

    if (listing.status === Status.INACTIVE) {
      throw new BadRequestException('Job listing is inactive');
    }

    const application = await this.prisma.application.findFirst({
      where: {
        AND: [{ listingId: +listingId }, { id: +applicationId }],
      },
    });

    if (!application) {
      throw new NotFoundException('You have not been assiged to this job');
    }

    if (
      application.status === Status.DECLINED ||
      application.status === Status.INACTIVE ||
      application.status === Status.PENDING
    ) {
      throw new BadRequestException(
        'Job has not been assigned to you or is inactive',
      );
    }

    const newReport = await this.prisma.listingReport.create({
      data: {
        comment,
        vendor: { connect: { id: +vendorId } },
        application: { connect: { id: +applicationId } },
      },
    });

    if (uploads && newReport) {
      const reportUploads = [];

      uploads.forEach(async (upload) => {
        reportUploads.push({
          name: upload.originalname,
          size: upload.size,
          type: upload.mimetype,
          bytes: upload.buffer,
          listingReportId: newReport.id,
        });
      });

      await this.prisma.upload.createMany({
        data: reportUploads,
      });
    }

    return true;
  }

  // Helpers
  async __checkIfListingExist(listingId: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: +listingId },
    });

    if (!listing) throw new BadRequestException('Job listing does not exist.');

    return listing;
  }
}
