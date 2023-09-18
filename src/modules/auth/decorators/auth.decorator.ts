import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

export const Auth = (roles?: UserRole[]) => {
  if (!roles?.length) return applyDecorators(UseGuards(JwtAuthGuard));
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
};
