import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  readonly description: string;
}

export class UpdateCategoryDto {
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  readonly description: string;
}

export class CategoryIdDto {
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}
