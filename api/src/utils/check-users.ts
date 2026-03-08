import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['jonyxdxp@gmail.com', 'fiomachado016@gmail.com']
      }
    },
    include: { estudiante: true }
  });
  
  console.log('Usuarios encontrados:', JSON.stringify(users, null, 2));
  
  const solicitudes = await prisma.solicitudAcceso.findMany({
    where: {
      email: {
        in: ['jonyxdxp@gmail.com', 'fiomachado016@gmail.com']
      }
    }
  });
  
  console.log('Solicitudes:', JSON.stringify(solicitudes, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);