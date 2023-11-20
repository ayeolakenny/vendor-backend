import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('downloads/:id')
  async getRequestFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.prisma.upload.findUnique({
      where: { id: +id },
    });

    if (!file.bytes) throw new BadRequestException('File not found');

    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);

    res.send(file.bytes);
  }
}
