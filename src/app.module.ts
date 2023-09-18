import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VendorModule } from './modules/vendor/vendor.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AuthModule, VendorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
