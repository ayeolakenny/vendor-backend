import { Controller, Post, Body, Delete, Patch, Param, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { ListingsService } from './listings.service';
import { RegisterListingsDto } from './dto/listings.request';

@Controller('listings')
export class ListingsController {
    constructor ( private readonly listings: ListingsService) {}

    @Post('create')
    async createListings(@Body() input: RegisterListingsDto, @Res() res: Response) {
        await this.listings.createListings(input);
        return res.status(200).json({message: 'A Job Offer Has Been Created', input: input});
    }

    @Get()
    async findAllListings() {
        await this.listings.findAllListings();
    }

    @Get(':id')
    async findOneListing(@Param('id') id: string) {
        await this.listings.findOneListing(+id);
    }

    @Delete(':id')
    async deleteListing(@Param('id') id: string, @Res() res: Response) {
        await this.listings.deleteListing(+id);
        return res.status(200).json({message: 'A Job Offer Has been Deleted'});
    }

    @Patch(':id')
    async updateListings(@Param('id') id: string, @Body() input: RegisterListingsDto, @Res() res: Response) {
        await this.listings.updateListings(+id, input);
        return res.status(200).json({message: 'A Job Has Been Updated', input: input});
    }
}
