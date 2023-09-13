import { IsString, IsNotEmpty } from "class-validator"
export class RegisterCategoryDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string
}