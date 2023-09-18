import { Body, Controller, Post, Delete, Param, Patch, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { CategoryService } from './category.service';
import { RegisterCategoryDto } from './dto/category.request';

@Controller('category')
export class CategoryController {
    constructor (private readonly category: CategoryService) {}

    @Post('create')
    async createCategory(@Body() input: RegisterCategoryDto, @Res() res: Response) {
        await this.category.createCategory(input);
        return res.status(200).json({message: 'A Category Has Been Created', input: input});
    }

    @Get()
    async findAllCategories() {
        await this.category.findAllCategories();
    }

    @Get(':id')
    async findOneCategory(@Param('id') id: string){
        await this.category.findOneCategory(+id)
    }

    @Delete(':id')
    async deleteCategory(@Param('id') id: string, @Res() res: Response) {
        await this.category.deleteCategory(+id);
        return res.status(200).json({message: 'A Category Has Been Deleted'});
    }

    @Patch(':id')
    async updateCategory(@Param('id') id: string, @Body() input: RegisterCategoryDto, @Res() res: Response) {
        await this.category.updateCategory(+id, input);
        return res.status(200).json({message: 'A Category Has Been Updated', input: input});
    }
}
