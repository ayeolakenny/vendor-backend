import { Body, Controller, Delete, Post, Put, Res, Get, Param } from '@nestjs/common';
import { Response } from 'express';
import { CategoryService } from './category.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRole } from '@prisma/client';
import {
  CategoryIdDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.request';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Auth([UserRole.ADMIN])
  @Post('create')
  async createCategory(@Body() input: CreateCategoryDto, @Res() res: Response) {
    await this.categoryService.createCategory(input);
    return res.status(201).json({ message: 'Category created' });
  }

  @Auth([UserRole.ADMIN])
  @Put('update')
  async updateCategory(@Body() input: UpdateCategoryDto, @Res() res: Response) {
    await this.categoryService.updateCategory(input);
    return res.status(200).json({ message: 'Category updated' });
  }

  @Auth([UserRole.ADMIN])
  @Delete('delete')
  async deleteCategory(@Body() input: CategoryIdDto, @Res() res: Response) {
    await this.categoryService.deleteCategory(input);
    return res.status(201).json({ message: 'Category deleted' });
  }
}
