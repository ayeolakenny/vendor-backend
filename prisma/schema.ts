import { Prisma } from '@prisma/client';

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
