import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'yo.com321@gmail.com' }
  });
  console.log('password:', user?.password);
  console.log('estado:', user?.estado);
  await prisma.$disconnect();
}

main().catch(console.error);