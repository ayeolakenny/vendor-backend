import { IsString, IsNotEmpty, IsNumber } from "class-validator"

export class RegisterListingsDto {
    
    @IsNotEmpty()
    @IsString()
    readonly jobName: string
    
    
    @IsNotEmpty()
    @IsString()
    readonly description: string
    
    
    @IsNotEmpty()
    @IsString()
    readonly attachment: string

    @IsNotEmpty()
    @IsNumber()
    readonly categoryId: number
}