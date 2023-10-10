import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const categoriesData = [
    { name: 'Electrical' },
    { name: 'Painting' },
    { name: 'Wood Works/Furniture' },
    { name: 'Iron Works' },
    { name: 'AC' },
    { name: 'Masonry' },
    { name: 'POP' },
    { name: 'Food & Nutrition' },
    { name: 'Landscape' },
    { name: 'Supplies - Consumables' },
    { name: 'Supplies - Equipment' },
    { name: 'Technical' },
    { name: 'Other' },
  ];

  await prisma.user.deleteMany({ where: { role: UserRole.ADMIN } });
  await prisma.category.deleteMany();

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

  const categories = await prisma.category.createMany({
    data: categoriesData,
  });
  console.log(categories);
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
