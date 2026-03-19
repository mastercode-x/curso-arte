const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('test1234', 10);
  await prisma.user.update({
    where: { email: 'yo.com321@gmail.com' },
    data: { password: hash }
  });
  console.log('Password updated:', hash);
  await prisma.$disconnect();
}

main().catch(console.error);