import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CategoryIdDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.request';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(input: CreateCategoryDto) {
    const { name, description } = input;
    await this.__checkIfSimilarCategoryExist(name);

    await this.prisma.category.create({
      data: { name, description },
    });

    return true;
  }

  async updateCategory(input: UpdateCategoryDto) {
    const { id, name } = input;
    await this.__checkIfCategoryExist(id);

    await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    return true;
  }

  async deleteCategory(input: CategoryIdDto) {
    const { id } = input;
    await this.__checkIfCategoryExist(id);
    await this.prisma.category.delete({
      where: { id },
    });
    return true;
  }

  async __checkIfCategoryExist(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) throw new NotFoundException('Category does not exist.');
  }

  async __checkIfSimilarCategoryExist(name: string) {
    const similarCategory = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });

    if (similarCategory) throw new ConflictException('similar category exists');
  }
}
