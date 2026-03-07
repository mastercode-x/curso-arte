# Backend - Poética de la Mirada

Backend para la plataforma de cursos "Poética de la Mirada".

## 🚀 Tecnologías

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para PostgreSQL
- **Mercado Pago** - Pasarela de pagos
- **Nodemailer** - Envío de emails
- **JWT** - Autenticación

## 📁 Estructura

```
api/
├── src/
│   ├── controllers/     # Controladores de rutas
│   ├── middleware/      # Middleware (auth, errores, etc.)
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades
│   └── server.ts        # Punto de entrada
├── prisma/
│   └── schema.prisma    # Esquema de base de datos
├── .env                 # Variables de entorno
└── package.json
```

## ⚡ Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Base de datos
npm run db:generate    # Generar cliente Prisma
npm run db:migrate     # Crear migraciones
npm run db:studio      # Abrir Prisma Studio
```

## 🔗 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| GET | `/api/auth/profile` | Perfil del usuario |
| POST | `/api/applications` | Crear solicitud |
| POST | `/api/applications/:id/approve` | Aprobar solicitud |
| POST | `/api/applications/:id/reject` | Rechazar solicitud |
| POST | `/api/payments/create-session` | Crear pago |
| GET | `/api/payments/my-payments` | Mis pagos |
| POST | `/api/webhooks/mercadopago` | Webhook MP |
| POST | `/api/webhooks/google-forms` | Webhook Forms |

## 📖 Documentación

- [Guía de Configuración](./SETUP.md)
- [Documentación de API](./API.md)

## 🌐 URLs

- **Health Check**: `GET /health`
- **API Base**: `/api`

---

Desarrollado para Poética de la Mirada
