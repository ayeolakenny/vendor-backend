import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterListingsDto } from './dto/listings.request';

@Injectable()
export class ListingsService {
    constructor (private prisma: PrismaService) {}

    async createListings(input: RegisterListingsDto) {
        const {jobName, description, attachment, categoryId} = input;
        await this.prisma.listings.create({
            data: {
                jobName,
                description,
                attachment,
                category: {connect: {id: categoryId}}
            }
        });
    }

    async findAllListings() {
        await this.prisma.listings.findMany({});
    }

    async findOneListing(id: number){
        await this.prisma.listings.findUnique({
            where: {id}
        });
    }

    async deleteListing(id: number) {
        await this.prisma.listings.delete({
            where: {id}
        });
    }

    async updateListings(id: number, input: RegisterListingsDto) {
        await this.prisma.listings.update({
            where: {id},
            data: input
        });
    }
}
