import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@zoracom.com',
      address: 'Lekki',
      firstName: 'Ayeola',
      lastName: 'Kehinde',
      role: UserRole.ADMIN,
      password: {
        create: {
          passwordHash: await argon2.hash('12345678'),
        },
      },
    },
  });
  console.log(admin);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
