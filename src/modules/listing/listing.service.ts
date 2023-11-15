import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateListingDto,
  ListingApplicationDto,
  ListingApplicationReviewDto,
  ListingIdDto,
  ListingReportUpdateDto,
  ListingStatusUpdate,
  UpdateListingDto,
} from './dto/listing.request';
import { Listing, Status } from '@prisma/client';
import { AuthPayload } from 'src/constants/types';

@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService) { }

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
        applications: {
          include: {
            vendor: true,
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

  /**
   * Retrieve information about a single listing.
   *
   * @param {string} listingId - The unique identifier of the listing.
   * @returns {Promise<Listing>} A promise that resolves to the listing information.
   */
  async singleListingInfo(listingId: string): Promise<any> {
    // Convert the listingId to a number
    const id = +listingId;

    // Use Prisma to fetch the listing and its related data
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        vendors: true,
        applications: true,
      },
    });

    if (!listing) {
      // If the listing is not found, throw a 404 NotFoundException
      throw new NotFoundException(`Listing with ID ${id} not found.`);
    }

    return listing;
  }

  /**
   * Create a new application for a vendor's listing and associate uploads.
   *
   * @param {ListingApplicationDto} input - The input data for creating the application.
   * @param {AuthPayload} user - The authenticated user's information.
   * @param {Express.Multer.File[]} uploads - An array of uploaded files to associate with the application.
   * @returns {Promise<boolean>} - A Promise that resolves to `true` on success.
   * @throws {Error} - Throws an error if the application submission fails.
   */
  async listingApplication(
    input: ListingApplicationDto,
    user: AuthPayload,
    uploads: Express.Multer.File[],
  ): Promise<any> {
    try {
      const vendorId = user.vendorId;
      const { listingId, comment } = input;

      await this.__checkIfListingExist(+listingId);

      // Check if vendor is allowed to apply
      await this.__checkIfVendorCanApply(+listingId, +vendorId);

      // Check if vendor has applied before
      const hasApplied = await this.prisma.application.findFirst({
        where: {
          AND: [{ vendorId }, { listingId: +listingId }],
        },
      });

      if (hasApplied) {
        throw new ConflictException(
          'You have previously applied for this job, kindly await a response',
        );
      }

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
            vendorId,
          });
        });

        await this.prisma.upload.createMany({
          data: applicationUploads,
        });
      }
      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listingApplicationReview(
    input: ListingApplicationReviewDto,
    uploads: Express.Multer.File[],
  ) {
    try {
      const {
        status,
        listingId,
        applicationId,
        vendorId,
        deliveryDate,
        description,
      } = input;

      // Check if the Listing application exists
      const listingApplication = await this.__findListingApplication(
        +applicationId,
        +vendorId,
      );

      if (!listingApplication) {
        throw new NotFoundException(
          `Application with id ${applicationId} not found.`,
        );
      }

      // Check if the listing exists
      const listing = await this.__checkIfListingExist(+listingId);
      if (!listing) {
        throw new NotFoundException(
          `Listing with the id ${listingId} not found.`,
        );
      }

      // If listing is been awarded before proceeding
      if (listing.status === 'AWARDED') {
        throw new Error('Job already awarded.');
      }

      // Award OR Decline the current listing application
      if (status === 'DECLINED') {
        await this.prisma.application.update({
          where: { id: +applicationId },
          data: {
            status: Status.DECLINED,
          },
        });
        return { message: 'Listing application declined!' };
        // TODO: send the vendor a declined email
      }

      await this.prisma.application.update({
        where: { id: +applicationId },
        data: {
          status: Status.AWARDED,
        },
      });

      // Update the status of the listing if awarded
      await this.prisma.listing.update({
        where: { id: +listingId },
        data: {
          status: Status.AWARDED,
        },
      });

      const awardedListing = await this.prisma.awardedListing.create({
        data: {
          deliveryDate,
          description,
          application: { connect: { id: +applicationId } },
          vendor: { connect: { id: +vendorId } },
        },
      });
      // TODO: send the vendor an approved email

      // Upload applicaiton files if there is
      if (uploads) {
        const applicationUploads = [];

        uploads.forEach(async (upload) => {
          applicationUploads.push({
            name: upload.originalname,
            size: upload.size,
            type: upload.mimetype,
            bytes: upload.buffer,
            applicationId: +applicationId,
            awardedListingId:
              status === Status.AWARDED ? awardedListing.id : null,
          });
        });

        await this.prisma.upload.createMany({
          data: applicationUploads,
        });
      }

      return {
        message: 'Listing awarded successfully!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // To update the status of a listing
  async listingStatusUpdate(listingId: string, input: ListingStatusUpdate) {
    const { status } = input
    try {
      // Check if the listing exists
      const listing = await this.__checkIfListingExist(+listingId);
      if (!listing) {
        throw new NotFoundException(`Listing with ID ${listingId} does not exists.`)
      }

      // Check if the listing has been awarded or not
      if (listing.status === "PENDING") {
        throw new BadRequestException("This listing has not be awarded.")
      }

      // Check if the listing db status = the status sent
      if (listing.status === status.toUpperCase()) {
        throw new BadRequestException(`This listing is ${status}`)
      }

      // STATUS = DELIVERED
      if (status.toUpperCase() === Status.DELIVERED) {
        await this.prisma.listing.update({
          where: { id: +listingId }, data: {
            status: Status.DELIVERED
          }
        })
        return {
          message: `Listing status updated to ${status}!`,
        };
      }

      // STATUS = ONGOING
      if (status.toUpperCase() === Status.ONGOING) {
        await this.prisma.listing.update({
          where: { id: +listingId }, data: {
            status: Status.ONGOING
          }
        })
        return {
          message: `Listing status updated to ${status}!`,
        };
      }

      // Invalid status response
      return {
        message: `${status} - Invalid listing status.`,
      };
    } catch (err) {
      return err.message
    }
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
  private async __checkIfListingExist(listingId: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: +listingId },
    });

    if (!listing) throw new BadRequestException('Job listing does not exist.');

    return listing;
  }

  private async __findListingApplication(
    applicationId: number,
    vendorId: number,
  ): Promise<any> {
    try {
      return await this.prisma.application.findFirst({
        where: {
          AND: [{ id: applicationId }, { vendorId }],
        },
      });
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException('Error finding listing');
    }
  }

  private async __checkIfVendorCanApply(listingId: number, vendorId: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: +listingId },
      include: { vendors: true },
    });

    const allowed = listing.vendors.find((v) => v.id === vendorId);

    if (!allowed) {
      throw new BadRequestException(
        'You are not allowed to apply to this job.',
      );
    }
  }
}
