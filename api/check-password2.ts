import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'yo.com321@gmail.com' }
  });
  console.log('password hash:', user?.password);
  const match = await bcrypt.compare('test1234', user?.password || '');
  console.log('password match:', match);
  await prisma.$disconnect();
}

main().catch(console.error);