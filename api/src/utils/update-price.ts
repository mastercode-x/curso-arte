import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const config = await prisma.configuracionProfesor.findFirst();
  
  if (!config) {
    console.log('❌ No se encontró configuración');
    return;
  }

  const updated = await prisma.configuracionProfesor.update({
    where: { id: config.id },
    data: { precioCurso: 100 } // Cambiá este valor
  });

  console.log(`✅ Precio actualizado a: ${updated.precioCurso} ${updated.moneda}`);
  await prisma.$disconnect();
}

main().catch(console.error);