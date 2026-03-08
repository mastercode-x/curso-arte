import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.update({ 
    where: { email: 'profesor@poetica.com' }, 
    data: { password: hash } 
  });
  console.log('✅ Contraseña actualizada correctamente');
  await prisma.$disconnect();
}

main().catch(console.error);