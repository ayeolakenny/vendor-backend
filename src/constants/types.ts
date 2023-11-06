import { Prisma, UserRole } from '@prisma/client';

export type AuthPayload = {
  email: string;
  role: UserRole;
  sub: number;
  vendorId: number;
};

export const authUserSelect = {
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    address: true,
    phoneNumber: true,
    role: true,
    vendor: true,
    password: true,
  },
} satisfies Prisma.UserDefaultArgs;

export type AuthUser = Prisma.UserGetPayload<typeof authUserSelect>;
