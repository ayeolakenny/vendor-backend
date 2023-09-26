import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}

export class UpdateCategoryDto {
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @IsNotEmpty()
  @IsString()
  readonly name: string;
}

export class CategoryIdDto {
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}
