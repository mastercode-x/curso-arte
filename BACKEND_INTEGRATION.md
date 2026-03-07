# Integración Frontend-Backend

Guía para conectar el frontend con el backend de Poética de la Mirada.

## 🔗 URLs de Conexión

### Desarrollo Local

```env
# Frontend .env
VITE_API_URL=http://localhost:3001/api
```

### Producción (Vercel + Railway)

```env
# Frontend .env
VITE_API_URL=https://tu-backend.railway.app/api
```

## 📋 Servicios del Frontend

### 1. Servicio de Autenticación

Crear archivo: `src/services/authService.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async register(data: { email: string; password: string; nombre: string; estudianteId: string }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

### 2. Servicio de Solicitudes

Crear archivo: `src/services/applicationService.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL;

export const applicationService = {
  // Crear solicitud (desde formulario)
  async createApplication(data: {
    nombre: string;
    email: string;
    telefono?: string;
    pais?: string;
    experiencia?: string;
    interes?: string;
  }) {
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Listar solicitudes (profesor)
  async getApplications(token: string, params?: { estado?: string; page?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_URL}/applications?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Aprobar solicitud (profesor)
  async approveApplication(token: string, id: string) {
    const response = await fetch(`${API_URL}/applications/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Rechazar solicitud (profesor)
  async rejectApplication(token: string, id: string, motivo?: string) {
    const response = await fetch(`${API_URL}/applications/${id}/reject`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ motivo })
    });
    return response.json();
  }
};
```

### 3. Servicio de Pagos

Crear archivo: `src/services/paymentService.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL;

export const paymentService = {
  // Obtener precio del curso (público)
  async getCoursePrice() {
    const response = await fetch(`${API_URL}/payments/price`);
    return response.json();
  },

  // Crear sesión de pago (estudiante)
  async createPaymentSession(token: string) {
    const response = await fetch(`${API_URL}/payments/create-session`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Verificar estado de pago
  async checkPaymentStatus(token: string, preferenceId: string) {
    const response = await fetch(`${API_URL}/payments/status/${preferenceId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Obtener mis pagos (estudiante)
  async getMyPayments(token: string) {
    const response = await fetch(`${API_URL}/payments/my-payments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Listar todos los pagos (profesor)
  async getAllPayments(token: string) {
    const response = await fetch(`${API_URL}/payments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

### 4. Servicio de Dashboard

Crear archivo: `src/services/dashboardService.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL;

export const dashboardService = {
  // Dashboard del estudiante
  async getStudentDashboard(token: string) {
    const response = await fetch(`${API_URL}/dashboard/student`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Dashboard del profesor
  async getProfessorDashboard(token: string) {
    const response = await fetch(`${API_URL}/dashboard/professor`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Estadísticas (profesor)
  async getStats(token: string) {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

## 🔐 Manejo de Tokens

Crear hook: `src/hooks/useAuth.ts`

```typescript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return { token, user, login, logout };
};
```

## 💳 Flujo de Pago con Mercado Pago

### 1. Estudiante aprobado recibe email

El backend envía un email con el link de pago (`initPoint`) cuando el profesor aprueba la solicitud.

### 2. Redirección a Mercado Pago

El estudiante hace clic en el link y es redirigido a Mercado Pago para completar el pago.

### 3. URLs de retorno

Mercado Pago redirige a:
- **Éxito**: `/pago-exitoso`
- **Fallido**: `/pago-fallido`
- **Pendiente**: `/pago-pendiente`

### 4. Confirmación de pago

El webhook del backend recibe la notificación de Mercado Pago y:
1. Actualiza el estado del pago
2. Genera una contraseña temporal
3. Envía email de bienvenida con credenciales

### 5. Página de éxito

Crear: `src/pages/PaymentSuccess.tsx`

```tsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const preferenceId = searchParams.get('preference_id');

  useEffect(() => {
    // Opcional: verificar estado del pago
    if (preferenceId) {
      checkPaymentStatus(preferenceId);
    }
  }, [preferenceId]);

  return (
    <div className="payment-success">
      <h1>¡Pago Exitoso!</h1>
      <p>Recibirás un email con tus credenciales de acceso.</p>
      <a href="/login">Ir al Login</a>
    </div>
  );
};
```

## 📧 Flujo de Google Forms

### 1. Crear formulario

URL del formulario: `https://forms.gle/TU_FORM_ID`

### 2. Configurar webhook

Sigue las instrucciones en `api/SETUP.md` para configurar el webhook de Google Forms.

### 3. Landing page

El botón "Unirse al Curso" debe redirigir al formulario de Google.

```tsx
<a 
  href="https://forms.gle/TU_FORM_ID" 
  target="_blank" 
  rel="noopener noreferrer"
  className="btn-primary"
>
  Unirse al Curso
</a>
```

## 🚀 Despliegue

### Frontend (Vercel)

1. Configurar variable de entorno:
   ```
   VITE_API_URL=https://tu-backend.railway.app/api
   ```

2. Deploy automático desde GitHub

### Backend (Railway)

1. Configurar variables de entorno (ver `api/SETUP.md`)
2. Configurar webhook de Mercado Pago
3. Configurar webhook de Google Forms

## 🧪 Testing

### Probar endpoints

```bash
# Health check
curl https://tu-backend.railway.app/health

# Crear solicitud
curl -X POST https://tu-backend.railway.app/api/applications \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com"}'

# Login como profesor
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"profesor@poetica.com","password":"admin123"}'
```

## 📞 Soporte

Para problemas de integración:
1. Verificar CORS en el backend
2. Revisar logs del backend
3. Verificar variables de entorno
