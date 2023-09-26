import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ListingIdDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;
}

export class CreateListingDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly vendors?: string[];
}

export class UpdateListingDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly vendors?: string[];
}

export class ListingApplicationDto {
  @IsNotEmpty()
  @IsString()
  readonly listingId: string;

  @IsNotEmpty()
  @IsString()
  readonly comment: string;
}

export class ListingReportUpdateDto {
  @IsNotEmpty()
  @IsString()
  readonly listingId: string;

  @IsNotEmpty()
  @IsString()
  readonly applicationId: string;

  @IsNotEmpty()
  @IsString()
  readonly comment: string;
}
