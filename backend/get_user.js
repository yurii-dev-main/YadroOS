const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user
  .findFirst()
  .then((u) => console.log('Email:', u.email))
  .finally(() => prisma.$disconnect());
