import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import {
  RegisterVendorDto,
  SendInviteLinkDto,
  VendorIdDto,
} from './dto/vendor.request.';
import { PrismaService } from 'src/prisma.service';
import * as argon2 from 'argon2';
import { generateToken } from 'src/utils/generateToken';
import { daysToUnix, unixToDaysLeft } from 'src/utils/date';
import { MailService } from '../mail/mail.service';
import { MAIL_MESSAGE, MAIL_SUBJECT } from '../mail/mail.contants';
import { VendorStatus } from '@prisma/client';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async sendVendorInviteLink(input: SendInviteLinkDto) {
    const { email } = input;

    await this.__checkIfVendorExists(email);

    const inviteToken = generateToken();

    await this.prisma.invite.create({
      data: {
        email: email,
        expires: `${daysToUnix(2)}`, // link expires in 2 days
        inviteToken,
      },
    });

    await this.mailService.sendMail({
      to: email,
      subject: MAIL_SUBJECT.VENDOR_INVITATION,
      html: MAIL_MESSAGE.VENDOR_INVITATION(
        `${process.env.CLIENT_DEPLOYED_URL}/registration?token=${inviteToken}`,
      ),
    });

    return true;
  }

  async registerVendor(
    input: RegisterVendorDto,
    uploads: Express.Multer.File[],
  ) {
    const {
      inviteToken,
      businessEmail,
      address,
      businessAddress,
      businessName,
      businessPhoneNumber,
      category,
      email,
      firstName,
      lastName,
      otherPhoneNumber,
      phoneNumber,
    } = input;

    await this.__checkIfInviteTokenIsValid(inviteToken, businessEmail);
    await this.__checkEmailTaken(email, businessEmail);
    await this.__checkPhonenumberTaken(businessPhoneNumber);
    await this.__checkPhonenumberTaken(phoneNumber);

    const passwordHash = await argon2.hash(lastName);

    const newUser = await this.prisma.user.create({
      data: {
        address,
        firstName,
        lastName,
        email,
        phoneNumber,
        password: {
          create: {
            passwordHash,
          },
        },
        vendor: {
          create: {
            address: businessAddress,
            businessName,
            category,
            email: businessEmail,
            phoneNumber: businessPhoneNumber,
            otherPhoneNumber,
          },
        },
      },
      include: {
        vendor: true,
      },
    });

    if (uploads && newUser) {
      const vendorUploads = [];

      uploads.forEach(async (upload) => {
        vendorUploads.push({
          name: upload.originalname,
          size: upload.size,
          type: upload.mimetype,
          bytes: upload.buffer,
          vendorId: newUser.vendor.id,
        });
      });

      await this.prisma.upload.createMany({
        data: vendorUploads,
      });
    }

    await this.__deleteVendorInvite(businessEmail, inviteToken);

    return true;
  }

  async getVendors(){
   const vendors =  await this.prisma.vendor.findMany({});
   return vendors;
  }

  async getOneVendor(id: number){
    const vendor = await this.prisma.vendor.findUnique({where: {id}});
    return vendor;
  }

  async approveVendor(input: VendorIdDto) {
    const { id } = input;

    const vendor = await this.__findVendorById(id);

    if (vendor.status === VendorStatus.APPROVED) {
      throw new ConflictException('Vendor is already approved.');
    }

    return await this.prisma.vendor.update({
      where: { id },
      data: { status: VendorStatus.APPROVED },
    });
  }

  async declineVendor(input: VendorIdDto) {
    const { id } = input;
    const vendor = await this.__findVendorById(id);

    if (vendor.status === VendorStatus.DECLINED) {
      throw new ConflictException('Vendor is already declined.');
    }

    return await this.prisma.vendor.update({
      where: { id },
      data: { status: VendorStatus.DECLINED },
    });
  }

  async deactivateVendor(input: VendorIdDto) {
    const { id } = input;
    const vendor = await this.__findVendorById(id);

    if (vendor.status === VendorStatus.DEACTIVATED) {
      throw new ConflictException('Vendor is already inactive.');
    }

    return await this.prisma.vendor.update({
      where: { id },
      data: { status: VendorStatus.DEACTIVATED },
    });
  }

  // HELPERS

  async __findVendorById(id: number) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new BadRequestException('Vendor does not exist.');
    return vendor;
  }

  async __checkIfVendorExists(email: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { email },
    });
    if (vendor) throw new BadRequestException('Vendor already exists.');
  }

  async __checkIfInviteTokenIsValid(inviteToken: string, vendorEmail: string) {
    const invite = await this.prisma.invite.findFirst({
      where: { inviteToken },
    });

    if (!invite) throw new BadRequestException('Invalid invite');

    if (invite.email !== vendorEmail) {
      throw new BadRequestException('Invalid invite');
    }

    if (unixToDaysLeft(Number(invite.expires)) < 1) {
      await this.prisma.invite.update({
        where: { id: invite.id },
        data: { valid: false },
      });
      throw new BadRequestException('Invalid invite');
    }

    if (!invite.valid) {
      throw new BadRequestException('Invalid invite');
    }
  }

  async __deleteVendorInvite(email: string, inviteToken: string) {
    await this.prisma.invite.deleteMany({
      where: { AND: [{ email }, { inviteToken }] },
    });
  }

  async __checkEmailTaken(userEmail: string, vendorEmail: string) {
    const userEmailTaken = await this.prisma.user.findFirst({
      where: { email: userEmail },
    });
    if (userEmailTaken) throw new ConflictException('email has been used');

    const vendorEmailTaken = await this.prisma.vendor.findUnique({
      where: { email: vendorEmail },
    });
    if (vendorEmailTaken) throw new ConflictException('email has been used');
  }

  async __checkPhonenumberTaken(phoneNumber: string) {
    const phoneNumberTaken = await this.prisma.user.findFirst({
      where: { phoneNumber },
    });
    if (phoneNumberTaken)
      throw new ConflictException('phone number has been used');

    const vendorPhoneNumberTaken = await this.prisma.vendor.findFirst({
      where: { phoneNumber },
    });
    if (vendorPhoneNumberTaken)
      throw new ConflictException('phone number has been used');
  }

  // async __checkIfInvitationExists(email: string) {
  //   const invite = await this.prisma.invite.findFirstOrThrow({
  //     where: { email },
  //   });

  //   if (invite.valid) throw new BadRequestException('Invite link is invalid.');

  //   if (unixToDaysLeft(Number(invite.expires)) < 1) {
  //     throw new BadRequestException('Invite link is invalid.');
  //   }
  // }
}
