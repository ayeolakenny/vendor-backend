import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ListingsController],
  providers: [ListingsService, PrismaService]
})
export class ListingsModule {}
