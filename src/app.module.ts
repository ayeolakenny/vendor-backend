import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VendorModule } from './modules/vendor/vendor.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { ListingModule } from './modules/listing/listing.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule, VendorModule, CategoryModule, ListingModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
