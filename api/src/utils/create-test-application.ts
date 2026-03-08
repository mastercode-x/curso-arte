import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Cambiá este email por uno real al que tengas acceso
  const testEmail = 'fiomachado27@gmail.com';

  // Eliminar solicitud previa si existe
  await prisma.solicitudAcceso.deleteMany({
    where: { email: testEmail }
  });

  const solicitud = await prisma.solicitudAcceso.create({
    data: {
      nombre: 'Prueba Email',
      email: testEmail,
      
      telefono: '1234567890',
      experiencia: 'Test experiencia',
      interes: 'Test interés',
      estado: 'pendiente'
    }
  });

  console.log('✅ Solicitud creada:', solicitud.id);
  console.log('📧 Email:', testEmail);
  console.log('Ahora aprobala desde el panel del profesor');

  await prisma.$disconnect();
}

main().catch(console.error);