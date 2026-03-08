# Guía de Configuración - Backend Poética de la Mirada

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- Cuenta de Mercado Pago (para pagos)
- Cuenta de email SMTP (para notificaciones)

---

## 🚀 Instalación Local

### 1. Instalar dependencias

```bash
cd api
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Configurar base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Crear migraciones
npm run db:migrate

# (Opcional) Seed de datos iniciales
npm run db:seed
```

### 4. Iniciar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

---

## ⚙️ Configuración de Mercado Pago

### 1. Crear cuenta en Mercado Pago

1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crear una cuenta o iniciar sesión
3. Ir a "Tu aplicación" > "Credenciales"

### 2. Obtener credenciales

**Modo Sandbox (Pruebas):**
- Access Token: `TEST-0000000000000000-000000-00000000000000000000000000000000-000000000`
- Public Key: `TEST-00000000-0000-0000-0000-000000000000`

**Modo Producción:**
- Access Token: `APP_USR-0000000000000000-000000-00000000000000000000000000000000-000000000`
- Public Key: `APP_USR-00000000-0000-0000-0000-000000000000`

### 3. Configurar Webhook

1. En el panel de Mercado Pago, ir a "Webhooks"
2. Agregar URL: `https://tu-backend.com/api/webhooks/mercadopago`
3. Seleccionar eventos:
   - `payment`
   - `merchant_order`

### 4. Variables de entorno

```env
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN
MP_PUBLIC_KEY=TU_PUBLIC_KEY
```

---

## 📧 Configuración de Email (SMTP)

### Opción 1: Gmail

1. Ir a [Google Account](https://myaccount.google.com/)
2. Seguridad > Verificación en dos pasos (activar)
3. Contraseñas de aplicaciones > Generar
4. Copiar la contraseña generada

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

### Opción 2: Outlook/Hotmail

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-password
```

### Opción 3: Otro proveedor

Consultar la documentación de tu proveedor de email.

---

## 📋 Configuración de Google Forms

### 1. Crear el formulario

Crear un formulario en Google Forms con los siguientes campos:
1. Nombre completo (respuesta corta)
2. Email (respuesta corta)
3. Teléfono (respuesta corta) - opcional
4. País (respuesta corta) - opcional
5. Experiencia previa (párrafo) - opcional
6. ¿Por qué quieres tomar el curso? (párrafo) - opcional

### 2. Configurar Apps Script

1. En el formulario, ir a **Extensiones** > **Apps Script**
2. Borrar el código por defecto y pegar el siguiente:

```javascript
function onFormSubmit(e) {
  const itemResponses = e.response.getItemResponses();
  
  // Mapear respuestas (ajustar índices según tu formulario)
  const data = {
    nombre: itemResponses[0]?.getResponse() || '',
    email: itemResponses[1]?.getResponse() || '',
    telefono: itemResponses[2]?.getResponse() || '',
    pais: itemResponses[3]?.getResponse() || '',
    experiencia: itemResponses[4]?.getResponse() || '',
    interes: itemResponses[5]?.getResponse() || ''
  };
  
  // Enviar al backend
  const BACKEND_URL = 'https://tu-backend.com/api/webhooks/google-forms';
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(data)
  };
  
  try {
    const response = UrlFetchApp.fetch(BACKEND_URL, options);
    Logger.log('Respuesta del servidor: ' + response.getContentText());
  } catch (error) {
    Logger.log('Error: ' + error);
  }
}

// Función para instalar el trigger
function installTrigger() {
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
  Logger.log('Trigger instalado correctamente');
}
```

3. Guardar (Ctrl+S)
4. Ejecutar la función `installTrigger` (botón ▶️)
5. Autorizar los permisos cuando se solicite

### 3. Probar el webhook

1. Enviar una respuesta de prueba en el formulario
2. Verificar en los logs de Apps Script (Ver > Registros)
3. Verificar en el backend que se recibió la solicitud

---

## 🗄️ Configuración de Base de Datos

### PostgreSQL Local

```bash
# Crear base de datos
createdb poetica_db

# Configurar .env
DATABASE_URL="postgresql://usuario:password@localhost:5432/poetica_db"
```

### PostgreSQL en Railway/Render

1. Crear nuevo servicio PostgreSQL
2. Copiar la URL de conexión
3. Configurar en `.env`:

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/nombre_db"
```

---

## 🔐 Variables de Entorno Completas

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@host:puerto/nombre_db"

# JWT (generar con: openssl rand -base64 32)
JWT_SECRET="tu-clave-secreta-super-segura"

# Servidor
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://curso2-nine.vercel.app/
BACKEND_URL=https://tu-backend.railway.app

# Mercado Pago
MP_ACCESS_TOKEN=TEST-0000000000000000-000000-00000000000000000000000000000000-000000000
MP_PUBLIC_KEY=TEST-00000000-0000-0000-0000-000000000000

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Logging
LOG_LEVEL=info
```

---

## 🚀 Despliegue en Railway

### 1. Preparar repositorio

```bash
# Asegurarse de que el código esté en GitHub
git add .
git commit -m "Backend listo para despliegue"
git push origin main
```

### 2. Configurar en Railway

1. Ir a [Railway](https://railway.app/)
2. Crear nuevo proyecto
3. Seleccionar "Deploy from GitHub repo"
4. Seleccionar tu repositorio

### 3. Agregar PostgreSQL

1. En el proyecto, click en "New"
2. Seleccionar "Database" > "Add PostgreSQL"
3. Railway generará automáticamente la variable `DATABASE_URL`

### 4. Configurar variables de entorno

Ir a "Variables" y agregar:

```
JWT_SECRET=tu-clave-secreta
NODE_ENV=production
FRONTEND_URL=https://curso-nine-psi.vercel.app
MP_ACCESS_TOKEN=tu-access-token
MP_PUBLIC_KEY=tu-public-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

### 5. Configurar build y start

En "Settings":
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 6. Configurar dominio

1. Ir a "Settings" > "Domains"
2. Generar dominio de Railway o configurar dominio personalizado
3. Copiar la URL para configurar en el frontend

---

## 🧪 Pruebas

### Verificar health check

```bash
curl https://tu-backend.railway.app/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### Probar webhook de Google Forms

```bash
curl -X POST https://tu-backend.railway.app/api/webhooks/google-forms \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@example.com",
    "telefono": "+1234567890",
    "pais": "Argentina"
  }'
```

### Probar creación de preferencia de pago

1. Crear un estudiante aprobado
2. Llamar al endpoint de crear pago:

```bash
curl -X POST https://tu-backend.railway.app/api/payments/create-session \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL

- Verificar `DATABASE_URL`
- Asegurar que PostgreSQL esté corriendo
- Verificar permisos de usuario

### Error de Mercado Pago

- Verificar `MP_ACCESS_TOKEN`
- Asegurar que el token sea del ambiente correcto (TEST/PROD)
- Verificar que el webhook esté configurado

### Emails no se envían

- Verificar configuración SMTP
- Revisar logs del servidor
- Verificar carpeta de spam
- Para Gmail: usar App Password, no la contraseña normal

### CORS errors

- Verificar `FRONTEND_URL` en variables de entorno
- Asegurar que el origen esté en la lista de permitidos

---

## 📞 Soporte

Para problemas técnicos:
1. Revisar los logs en Railway (`railway logs`)
2. Verificar la configuración de variables de entorno
3. Consultar la documentación de Mercado Pago: https://www.mercadopago.com.ar/developers
