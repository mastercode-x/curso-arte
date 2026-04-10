import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KEEP_EMAIL = 'cristophergonzalezok@gmail.com';

async function main() {
  console.log('🔍 Buscando usuario a conservar...');

  const cristopher = await prisma.user.findUnique({
    where: { email: KEEP_EMAIL },
    include: { estudiante: true }
  });

  if (!cristopher) {
    console.log(`⚠️  No se encontró el usuario ${KEEP_EMAIL}. Abortando para no borrar todo.`);
    process.exit(1);
  }

  console.log(`✅ Conservando: ${cristopher.nombre} (${cristopher.email})`);
  const cristopherId = cristopher.id;
  const cristopherEstudianteId = cristopher.estudiante?.id;

  // 1. Pagos de todos los estudiantes EXCEPTO Cristopher
  const pagos = await prisma.pago.deleteMany({
    where: {
      estudiante: {
        user: {
          rol: 'estudiante',
          id: { not: cristopherId }
        }
      }
    }
  });
  console.log(`🗑  Pagos eliminados: ${pagos.count}`);

  // 2. Progreso de todos EXCEPTO Cristopher
  const progreso = await prisma.progresoEstudiante.deleteMany({
    where: cristopherEstudianteId
      ? { estudianteId: { not: cristopherEstudianteId } }
      : {}
  });
  console.log(`🗑  Progreso eliminado: ${progreso.count}`);

  // 3. Solicitudes de todos EXCEPTO Cristopher
  const solicitudes = await prisma.solicitudAcceso.deleteMany({
    where: { email: { not: KEEP_EMAIL } }
  });
  console.log(`🗑  Solicitudes eliminadas: ${solicitudes.count}`);

  // 4. Estudiantes EXCEPTO Cristopher
  const estudiantes = await prisma.estudiante.deleteMany({
    where: { user: { id: { not: cristopherId } } }
  });
  console.log(`🗑  Estudiantes eliminados: ${estudiantes.count}`);

  // 5. Usuarios estudiantes EXCEPTO Cristopher
  const users = await prisma.user.deleteMany({
    where: {
      rol: 'estudiante',
      id: { not: cristopherId }
    }
  });
  console.log(`🗑  Usuarios eliminados: ${users.count}`);



  // 6. Borrar solicitud de prueba "EWFSD" de Cristopher
  const solPrueba = await prisma.solicitudAcceso.deleteMany({
    where: {
      email: KEEP_EMAIL,
      nombre: { contains: 'EWFSD', mode: 'insensitive' }
    }
  });
  console.log(`🗑  Solicitud de prueba de Cristopher eliminada: ${solPrueba.count}`);

  // 7. Borrar el pago de $100 de Cristopher (dejar solo los de $50)
  const pagoDuplicado = await prisma.pago.deleteMany({
    where: {
      estudianteId: cristopherEstudianteId,
      monto: { equals: 100 }
    }
  });
  console.log(`🗑  Pago duplicado de $100 eliminado: ${pagoDuplicado.count}`);

  console.log('\n🎉 Listo. Se conservaron:');
  console.log(`   - Profesor y su configuración`);
  console.log(`   - ${cristopher.nombre} (${cristopher.email})`);
  console.log(`   - Módulos, calendario y configuración intactos`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
});