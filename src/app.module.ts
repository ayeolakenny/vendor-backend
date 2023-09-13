import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VendorModule } from './modules/vendor/vendor.module';
import { CategoryModule } from './modules/category/category.module';
import { ListingsModule } from './modules/listings/listings.module';

@Module({
  imports: [VendorModule, CategoryModule, ListingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
