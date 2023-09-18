import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterCategoryDto } from './dto/category.request';

@Injectable()
export class CategoryService {
    constructor (private prisma: PrismaService) {}
    async createCategory(input: RegisterCategoryDto){
        const {name} = input;
        await this.prisma.category.create({
            data: {name}
        });
    }

    async findAllCategories(){
        await this.prisma.category.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
    }

    async findOneCategory(id: number){
        await this.prisma.category.findUnique({where: {id}})
    }

    async deleteCategory(id: number){
        await this.prisma.category.delete({where: {id}});
    }

    async updateCategory(id: number, input: RegisterCategoryDto) {
        await this.prisma.category.update({
            where: {id},
            data: input
        });
    }
}
