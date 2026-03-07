import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Verificar si ya existe un profesor
  const existingProfessor = await prisma.profesor.findFirst();

  if (existingProfessor) {
    console.log('✅ Ya existe un profesor configurado');
    return;
  }

  // Crear profesor por defecto
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const profesor = await prisma.user.create({
    data: {
      email: 'profesor@poetica.com',
      password: hashedPassword,
      nombre: 'Profesor Poética',
      rol: 'profesor',
      estado: 'activo',
      profesor: {
        create: {
          permisos: ['*']
        }
      }
    },
    include: { profesor: true }
  });

  // Crear configuración del profesor
  await prisma.configuracionProfesor.create({
    data: {
      profesorId: profesor.profesor!.id,
      nombreCurso: 'Poética de la Mirada',
      descripcionCurso: 'Un curso de arte que explora la mirada como acto creativo',
      precioCurso: 50000, // Precio en ARS
      moneda: 'ARS',
      bioProfesor: 'Artista y educador con más de 10 años de experiencia',
      emailContacto: 'profesor@poetica.com',
      emailNotificaciones: 'profesor@poetica.com',
      notificarEmail: true,
      notificarWhatsApp: false
    }
  });

  console.log('✅ Profesor creado:');
  console.log(`   Email: profesor@poetica.com`);
  console.log(`   Contraseña: admin123`);

  // Crear módulos iniciales
  const modulosData = [
    {
      titulo: 'El silencio de la mirada',
      descripcion: 'Antes de pintar, mirar. Aprender a detenerse, recorrer una imagen con la atención y registrar lo que se siente antes de lo que se piensa.',
      orden: 1,
      duracion: '2 semanas',
      objetivos: ['Desarrollar la capacidad de observación prolongada', 'Registrar sensaciones antes de juicios', 'Construir un vocabulario visual personal'],
      estado: 'publicado' as const,
      contenido: [
        { type: 'text', title: 'La mirada como acto creativo', body: 'Todo comienza con la mirada. Antes del pincel, antes del lienzo, antes de cualquier técnica, está el acto de ver.' },
        { type: 'quote', quote: 'Ver es un acto político. Decidir en qué fijamos nuestra atención determina qué mundo construimos.', author: 'John Berger' }
      ],
      ejercicio: { title: 'El ejercicio del minuto', description: 'Durante 7 días, dedica 10 minutos a mirar un mismo objeto.', deadline: '20 de Octubre 2026' },
      recursos: [{ title: 'Ways of Seeing - John Berger', type: 'libro' }]
    },
    {
      titulo: 'La composición y el equilibrio',
      descripcion: 'Reglas para romperlas. Usar la geometría como punto de partida, y luego desplazar, recortar, equilibrar por instinto.',
      orden: 2,
      duracion: '2 semanas',
      objetivos: ['Comprender las reglas clásicas de composición', 'Aprender a romperlas con intención', 'Desarrollar el equilibrio por instinto'],
      estado: 'publicado' as const,
      contenido: [
        { type: 'text', title: 'La regla de los tercios', body: 'La regla de los tercios es uno de los principios más conocidos de la composición visual.' }
      ],
      ejercicio: { title: 'Composición con restricciones', description: 'Crea 5 composiciones usando solo líneas horizontales y verticales.', deadline: '03 de Noviembre 2026' },
      recursos: [{ title: 'La composición en la pintura - Jacques Block', type: 'libro' }]
    },
    {
      titulo: 'El color y su poética',
      descripcion: 'El color no decora: dice. Cómo construir una paleta con intención, mantener la coherencia y dejar que el contraste cuente la historia.',
      orden: 3,
      duracion: '2 semanas',
      objetivos: ['Comprender la psicología del color', 'Construir paletas con intención', 'Usar el contraste como narrativa'],
      estado: 'publicado' as const,
      contenido: [
        { type: 'text', title: 'El color como lenguaje', body: 'El color es uno de los lenguajes más antiguos y universales.' }
      ],
      ejercicio: { title: 'Paleta emocional', description: 'Elige una emoción y crea una paleta de 5 colores que la represente.', deadline: '17 de Noviembre 2026' },
      recursos: [{ title: 'Interacción del color - Josef Albers', type: 'libro' }]
    },
    {
      titulo: 'La materia y la textura',
      descripcion: 'Capas, impasto, transparencias. Cómo la textura modifica la luz y cómo la materia se convierte en narrativa.',
      orden: 4,
      duracion: '2 semanas',
      objetivos: ['Explorar diferentes técnicas de textura', 'Comprender cómo la materia afecta la luz', 'Usar la textura como elemento narrativo'],
      estado: 'borrador' as const,
      contenido: [],
      ejercicio: { title: 'Mapa de texturas', description: 'Recorre tu barrio y documenta 10 texturas diferentes.', deadline: '01 de Diciembre 2026' },
      recursos: []
    },
    {
      titulo: 'La forma y la abstracción',
      descripcion: 'Simplificar sin perder la emoción. Ejercicios de reducción, ritmo y silencio para que la forma respire.',
      orden: 5,
      duracion: '2 semanas',
      objetivos: ['Aprender a simplificar formas complejas', 'Mantener la emoción en la abstracción', 'Crear ritmo visual'],
      estado: 'borrador' as const,
      contenido: [],
      ejercicio: { title: 'De lo concreto a lo abstracto', description: 'Elige una fotografía y crea 5 versiones, cada una más abstracta.', deadline: '15 de Diciembre 2026' },
      recursos: []
    },
    {
      titulo: 'La luz y la atmósfera',
      descripcion: 'La luz como protagonista. Cómo capturar la atmósfera, jugar con sombras y resplandores, y crear profundidad emocional.',
      orden: 6,
      duracion: '2 semanas',
      objetivos: ['Comprender la luz como elemento narrativo', 'Capturar diferentes atmósferas', 'Crear profundidad emocional'],
      estado: 'borrador' as const,
      contenido: [],
      ejercicio: { title: 'Estudio de luz', description: 'Fotografía el mismo espacio a 5 momentos diferentes del día.', deadline: '29 de Diciembre 2026' },
      recursos: []
    },
    {
      titulo: 'La naturaleza como espejo',
      descripcion: 'El paisaje interior y exterior. Aprender a leer la naturaleza como metáfora y traducirla en imágenes propias.',
      orden: 7,
      duracion: '2 semanas',
      objetivos: ['Leer el paisaje como metáfora', 'Conectar naturaleza e interioridad', 'Crear imágenes desde la experiencia'],
      estado: 'borrador' as const,
      contenido: [],
      ejercicio: { title: 'Diario de paisaje', description: 'Visita el mismo lugar natural 3 veces en diferentes estados de ánimo.', deadline: '12 de Enero 2027' },
      recursos: []
    },
    {
      titulo: 'La obra y su sentido',
      descripcion: 'Del proceso al resultado. Cómo encontrar la intención detrás de cada obra y darle cierre sin perder la apertura.',
      orden: 8,
      duracion: '2 semanas',
      objetivos: ['Encontrar la intención de la obra', 'Dar cierre al proceso creativo', 'Mantener la apertura en la finalización'],
      estado: 'borrador' as const,
      contenido: [],
      ejercicio: { title: 'Proyecto final', description: 'Crea una obra que sintetice todo lo aprendido en el curso.', deadline: '26 de Enero 2027' },
      recursos: []
    }
  ];

  for (const moduloData of modulosData) {
    await prisma.modulo.create({
      data: moduloData
    });
  }

  console.log(`✅ ${modulosData.length} módulos creados`);

  console.log('\n🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
