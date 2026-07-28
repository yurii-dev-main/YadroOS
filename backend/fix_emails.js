const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    await prisma.user.update({
      where: { id: u.id },
      data: { email: u.email.toLowerCase() }
    });
  }
  console.log('Fixed all user emails to lowercase!');
}
main().finally(() => prisma.$disconnect());
