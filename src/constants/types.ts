import { UserRole } from '@prisma/client';

export type AuthPayload = {
  email: string;
  role: UserRole;
  sub: number;
  vendorId: number;
};
