# Resumen de Cambios - Backend

Este documento resume todos los cambios realizados al backend de Poética de la Mirada.

## 🔄 Cambios Principales

### 1. Reemplazo de Stripe por Mercado Pago

**Archivos modificados:**
- `api/src/services/paymentService.ts` - Reescrito completamente
- `api/src/controllers/paymentController.ts` - Actualizado para MP
- `api/src/controllers/webhookController.ts` - Nuevo webhook para MP
- `api/src/routes/webhooks.ts` - Rutas actualizadas
- `api/package.json` - Dependencia cambiada

**Cambios clave:**
- ✅ Integración completa con Mercado Pago SDK
- ✅ Creación de preferencias de pago
- ✅ Webhook para notificaciones de pago
- ✅ Procesamiento de pagos aprobados
- ✅ Generación automática de contraseñas
- ✅ Envío de emails con credenciales

### 2. Mejoras en el Servicio de Email

**Archivos modificados:**
- `api/src/services/emailService.ts` - Reescrito con más templates

**Nuevos templates:**
- ✅ `welcomeWithCredentials` - Bienvenida con email y contraseña
- ✅ `paymentApproved` - Solicitud aprobada con link de pago
- ✅ `applicationRejected` - Solicitud rechazada
- ✅ `newApplication` - Notificación al profesor
- ✅ `paymentReminder` - Recordatorio de pago

**Características:**
- Configuración SMTP desde base de datos o variables de entorno
- Verificación de conexión SMTP
- Mejor diseño de emails con estilos inline

### 3. Configuración de Google Forms

**Archivos modificados:**
- `api/src/controllers/webhookController.ts` - Webhook para Forms

**Flujo implementado:**
1. Usuario completa formulario de Google
2. Apps Script envía datos al webhook
3. Backend crea solicitud pendiente
4. Profesor recibe notificación por email
5. Profesor aprueba/rechaza desde dashboard

### 4. Actualización del Schema de Prisma

**Archivos modificados:**
- `api/prisma/schema.prisma`

**Cambios:**
- Reemplazados campos de Stripe por campos de Mercado Pago
- Agregados campos de configuración SMTP
- Moneda por defecto cambiada a ARS

```prisma
// Antes
stripeSecretKey   String?   @map("stripe_secret_key")
stripePublicKey   String?   @map("stripe_public_key")
stripeWebhookSecret String? @map("stripe_webhook_secret")

// Después
mpAccessToken     String?   @map("mp_access_token")
mpPublicKey       String?   @map("mp_public_key")
mpWebhookSecret   String?   @map("mp_webhook_secret")

// Nuevos campos SMTP
smtpHost          String?   @map("smtp_host")
smtpPort          Int?      @map("smtp_port") @default(587)
smtpUser          String?   @map("smtp_user")
smtpPass          String?   @map("smtp_pass")
```

### 5. Flujo de Aprobación de Estudiantes

**Archivos modificados:**
- `api/src/controllers/applicationController.ts`

**Flujo completo:**
1. ✅ Usuario completa formulario de Google Forms
2. ✅ Se crea solicitud con estado "pendiente"
3. ✅ Profesor recibe notificación por email
4. ✅ Profesor aprueba solicitud desde dashboard
5. ✅ Se crea usuario y estudiante (sin contraseña)
6. ✅ Se genera preferencia de pago en Mercado Pago
7. ✅ Se envía email al estudiante con link de pago
8. ✅ Estudiante paga en Mercado Pago
9. ✅ Webhook recibe confirmación de pago
10. ✅ Se genera contraseña temporal
11. ✅ Se envía email con credenciales de acceso
12. ✅ Estudiante puede iniciar sesión

### 6. Documentación

**Nuevos archivos:**
- `api/SETUP.md` - Guía completa de configuración
- `api/README.md` - Documentación rápida
- `BACKEND_INTEGRATION.md` - Guía de integración frontend
- `BACKEND_CHANGES.md` - Este archivo

## 📁 Estructura del Backend

```
api/
├── prisma/
│   └── schema.prisma          # Schema de base de datos
├── src/
│   ├── controllers/           # Controladores
│   │   ├── authController.ts
│   │   ├── applicationController.ts
│   │   ├── paymentController.ts
│   │   ├── webhookController.ts
│   │   └── ...
│   ├── middleware/            # Middleware
│   │   ├── auth.ts           # Autenticación JWT
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── routes/                # Rutas
│   │   ├── auth.ts
│   │   ├── applications.ts
│   │   ├── payments.ts
│   │   ├── webhooks.ts
│   │   └── ...
│   ├── services/              # Lógica de negocio
│   │   ├── paymentService.ts  # Mercado Pago
│   │   └── emailService.ts    # Envío de emails
│   ├── utils/                 # Utilidades
│   │   ├── seed.ts           # Datos iniciales
│   │   └── logger.ts
│   └── server.ts              # Punto de entrada
├── .env                       # Variables de entorno
├── package.json
└── tsconfig.json
```

## 🔧 Variables de Entorno

### Nuevas variables requeridas:

```env
# Mercado Pago (obligatorio)
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN_DE_MERCADO_PAGO
MP_PUBLIC_KEY=TU_PUBLIC_KEY_DE_MERCADO_PAGO

# Backend URL (obligatorio)
BACKEND_URL=https://tu-backend.railway.app

# SMTP (opcional pero recomendado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

### Variables eliminadas:

```env
# Stripe (ya no se usa)
STRIPE_SECRET_KEY
STRIPE_PUBLIC_KEY
STRIPE_WEBHOOK_SECRET
```

## 🚀 Pasos para Desplegar

### 1. Preparar el backend

```bash
cd api
npm install
```

### 2. Configurar variables de entorno

Editar `api/.env` con tus credenciales.

### 3. Configurar base de datos

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Probar localmente

```bash
npm run dev
```

### 5. Desplegar en Railway

1. Subir código a GitHub
2. Crear proyecto en Railway
3. Agregar PostgreSQL
4. Configurar variables de entorno
5. Deploy

### 6. Configurar Mercado Pago

1. Ir al panel de desarrolladores
2. Configurar webhook: `https://tu-backend.railway.app/api/webhooks/mercadopago`
3. Seleccionar eventos: `payment`, `merchant_order`

### 7. Configurar Google Forms

1. Crear formulario
2. Configurar Apps Script (ver `api/SETUP.md`)
3. Probar envío de formulario

## 📊 Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Perfil del usuario
- `PUT /api/auth/profile` - Actualizar perfil

### Solicitudes
- `POST /api/applications` - Crear solicitud
- `GET /api/applications` - Listar solicitudes (profesor)
- `POST /api/applications/:id/approve` - Aprobar (profesor)
- `POST /api/applications/:id/reject` - Rechazar (profesor)

### Pagos
- `GET /api/payments/price` - Precio del curso
- `POST /api/payments/create-session` - Crear pago (estudiante)
- `GET /api/payments/my-payments` - Mis pagos (estudiante)
- `GET /api/payments` - Todos los pagos (profesor)
- `POST /api/payments/refund/:id` - Reembolsar (profesor)

### Webhooks
- `POST /api/webhooks/mercadopago` - Notificaciones MP
- `POST /api/webhooks/google-forms` - Formularios Google

## ✅ Checklist de Verificación

- [ ] Backend desplegado y accesible
- [ ] Base de datos conectada
- [ ] Mercado Pago configurado
- [ ] Webhook de MP funcionando
- [ ] SMTP configurado
- [ ] Emails se envían correctamente
- [ ] Google Forms configurado
- [ ] Webhook de Forms funcionando
- [ ] Frontend conectado al backend
- [ ] Flujo completo probado

## 🐛 Solución de Problemas Comunes

### Error CORS
Verificar que `FRONTEND_URL` esté configurado correctamente.

### Emails no llegan
- Verificar configuración SMTP
- Revisar carpeta de spam
- Usar App Password para Gmail

### Pagos no se procesan
- Verificar `MP_ACCESS_TOKEN`
- Verificar que el webhook esté configurado
- Revisar logs del servidor

### Google Forms no envía datos
- Verificar URL del webhook
- Revisar logs de Apps Script
- Verificar que el trigger esté instalado

## 📞 Soporte

Para más información, consultar:
- `api/SETUP.md` - Guía detallada de configuración
- `api/API.md` - Documentación de la API
- `BACKEND_INTEGRATION.md` - Integración con frontend
