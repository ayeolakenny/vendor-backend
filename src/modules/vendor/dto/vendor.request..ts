import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class SendInviteLinkDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class RegisterVendorDto {
  // Vendor Business Info
  @IsNotEmpty()
  @IsString()
  readonly businessName: string;

  @IsNotEmpty()
  @IsString()
  readonly businessAddress: string;

  @IsNotEmpty()
  @IsEmail()
  readonly businessEmail: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  readonly businessPhoneNumber: string;

  @IsOptional()
  @IsPhoneNumber('NG', { message: 'Invalid phone number' })
  readonly otherPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  readonly category: string;

  // Vendor Personal Info
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsPhoneNumber('NG', { message: 'Invalid phone number' })
  readonly phoneNumber: string;

  // Invite Token
  @IsNotEmpty()
  @IsString()
  readonly inviteToken: string;
}
export class VendorIdDto {
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}
