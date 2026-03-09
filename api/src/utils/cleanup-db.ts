import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Eliminar en orden correcto por las foreign keys
  
  const pagos = await prisma.pago.deleteMany({
    where: { estudiante: { user: { rol: 'estudiante' } } }
  });
  console.log(`✅ Pagos eliminados: ${pagos.count}`);

  const progreso = await prisma.progresoEstudiante.deleteMany({});
  console.log(`✅ Progreso eliminado: ${progreso.count}`);

  const solicitudes = await prisma.solicitudAcceso.deleteMany({});
  console.log(`✅ Solicitudes eliminadas: ${solicitudes.count}`);

  const estudiantes = await prisma.estudiante.deleteMany({});
  console.log(`✅ Estudiantes eliminados: ${estudiantes.count}`);

  const users = await prisma.user.deleteMany({
    where: { rol: 'estudiante' }
  });
  console.log(`✅ Usuarios estudiantes eliminados: ${users.count}`);

  console.log('\n🎉 Base de datos limpia. El profesor y su configuración se mantienen.');
  
  await prisma.$disconnect();
}

main().catch(console.error);