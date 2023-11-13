import { PrismaClient, UserRole } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // const categoriesData = [
  //   { name: 'Electrical' },
  //   { name: 'Painting' },
  //   { name: 'Wood Works/Furniture' },
  //   { name: 'Iron Works' },
  //   { name: 'AC' },
  //   { name: 'Masonry' },
  //   { name: 'POP' },
  //   { name: 'Food & Nutrition' },
  //   { name: 'Landscape' },
  //   { name: 'Supplies - Consumables' },
  //   { name: 'Supplies - Equipment' },
  //   { name: 'Technical' },
  //   { name: 'Other' },
  // ];

  // await prisma.user.deleteMany({ where: { role: UserRole.ADMIN } });
  // await prisma.category.deleteMany();

  // const admin = await prisma.user.create({
  //   data: {
  //     email: 'admin@zoracom.com',
  //     address: 'Lekki',
  //     firstName: 'Ayeola',
  //     lastName: 'Kehinde',
  //     role: UserRole.ADMIN,
  //     password: {
  //       create: {
  //         passwordHash: await argon2.hash('12345678'),
  //       },
  //     },
  //   },
  // });
  // console.log(admin);

  // const categories = await prisma.category.createMany({
  //   data: categoriesData,
  // });
  // console.log(categories);

  const categories = [
    'Electrical',
    'IT',
    'Building',
    'Construction',
    'Hardware',
    'Software',
    'Oil and Gas',
    'Solar',
    'AC',
    'Janitor',
  ];

  [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(async (_, idx) => {
    await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        address: faker.location.streetAddress(),
        email: faker.internet.email(),
        password: {
          create: {
            passwordHash: await argon2.hash('12345678'),
          },
        },
        phoneNumber: faker.phone.number(),
        role: UserRole.VENDOR,
        vendor: {
          create: {
            address: faker.location.streetAddress(),
            businessName: faker.company.name(),
            category: categories[idx],
            email: faker.internet.email(),
            phoneNumber: faker.phone.number(),
            status: 'APPROVED',
            otherPhoneNumber: faker.phone.number(),
          },
        },
      },
    });
  });
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
