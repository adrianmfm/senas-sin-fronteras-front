# 🔥 Guía Completa de Firebase Authentication

## 📋 **Para tu Colaborador - Todo está listo para usar**

¡Hola! 👋 Este proyecto ya tiene Firebase Authentication completamente configurado. Solo necesitas seguir esta guía para usar el sistema de autenticación.

## 🚀 **Configuración Inicial (5 minutos)**

### 1. **Clona y configura el proyecto:**
```bash
git clone [tu-repo]
cd senas-sin-fronteras-front
npm install
```

### 2. **Configura las variables de entorno:**
```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local con las credenciales reales
# (Las credenciales te las debe dar el dueño del proyecto)
```

### 3. **Prueba que todo funciona:**
```bash
npm run dev
```

Visita: `http://localhost:3000/login` 

**¡Si ves la página de login oficial, todo está funcionando!** ✅

---

## 🛠️ **Sistema de Login Oficial**

### **Componente Principal: LoginForm**

El proyecto incluye un componente de login profesional y completo:

```typescript
import { LoginForm } from '@/components/auth/LoginForm';

export const MiComponente = () => {
  return (
    <LoginForm 
      onSuccess={() => {
        // Redirigir después del login exitoso
        window.location.href = '/dashboard';
      }}
    />
  );
};
```

### **Páginas Disponibles:**

- **`/login`** - Página oficial de login/registro
- **Página principal** - Con `SimpleLoginExample` integrado

### **Características del LoginForm:**

- ✅ Login y registro en un solo componente
- ✅ Validación de formularios en tiempo real
- ✅ Manejo de errores user-friendly
- ✅ Login con Google integrado
- ✅ Diseño responsivo y profesional
- ✅ Estados de carga y disabled
- ✅ Iconos y UX moderna

---

## 🛠️ **Uso Programático con Hooks**

### **Opción 1: Hook useAuth (Recomendado)**

```typescript
import { useAuth } from '@/hooks/useAuth';

export const MiComponenteLogin = () => {
  const { user, loading, login, register, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const result = await login('email@test.com', 'password123');
    if (result.success) {
      console.log('Login exitoso!', result.user);
    } else {
      console.log('Error:', result.error);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (isAuthenticated) return <div>¡Hola {user?.email}!</div>;
  
  return (
    <button onClick={handleLogin}>
      Iniciar Sesión
    </button>
  );
};
```

### **Opción 2: Servicio directo AuthService**

```typescript
import { AuthService } from '@/services/authService';

export const MiOtroComponente = () => {
  const handleLogin = async () => {
    const result = await AuthService.loginWithEmail('email@test.com', 'password123');
    if (result.success) {
      console.log('Usuario logueado:', result.user);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
};
```

---

## 📚 **Métodos Disponibles**

### **🔐 Login y Registro**
```typescript
// Login con email
const result = await login('email@test.com', 'password123');

// Registro nuevo usuario
const result = await register('nuevo@email.com', 'password123');

// Login con Google (popup)
const result = await loginWithGoogle();

// Cerrar sesión
const result = await logout();
```

### **🛡️ Gestión de Contraseñas**
```typescript
// Enviar email de reset
const result = await sendPasswordReset('email@test.com');
```

### **👤 Gestión de Perfil**
```typescript
// Actualizar nombre del usuario
const result = await updateProfile('Nuevo Nombre');
```

### **📊 Estado del Usuario**
```typescript
const { user, loading, isAuthenticated } = useAuth();

// user: objeto completo del usuario o null
// loading: true si está cargando
// isAuthenticated: true si está logueado
```

---

## 🎯 **Ejemplos Listos para Copiar**

### **1. Login Simple (Copia y Pega):**

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const MiLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      alert('¡Login exitoso!');
    } else {
      alert('Error: ' + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required 
      />
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Cargando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};
```

### **2. Dashboard de Usuario:**

```typescript
import { useAuth } from '@/hooks/useAuth';

export const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>No estás logueado</div>;
  }

  return (
    <div>
      <h1>Bienvenido, {user?.email}!</h1>
      <p>UID: {user?.uid}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};
```

### **3. Componente Completo (Login + Registro):**

Mira el archivo: `src/components/auth/SimpleLoginExample.tsx`

---

## 🧪 **Cómo Probar el Sistema**

### **1. Página de Login Oficial:**
Ve a: `http://localhost:3000/login`

### **2. Crear usuarios de prueba:**
- Usa el formulario de registro en `/login`
- O usa login con Google

### **3. Verificar en Firebase Console:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto
3. Authentication > Users
4. Verás los usuarios que hayas creado

---

## 📁 **Estructura de Archivos (Ya creada)**

```
src/
├── lib/
│   └── firebase.ts              ✅ Configuración Firebase
├── services/
│   └── authService.ts           ✅ Servicio de autenticación
├── hooks/
│   └── useAuth.ts               ✅ Hook personalizado
├── types/
│   └── auth.ts                  ✅ Tipos TypeScript
├── contexts/
│   └── AuthContext.tsx          ✅ Contexto global
├── components/auth/
│   ├── LoginForm.tsx            ✅ Componente oficial de login
│   └── SimpleLoginExample.tsx   ✅ Ejemplo con dashboard
└── app/
    └── login/
        └── page.tsx             ✅ Página oficial de login
```

---

## ⚡ **Quick Start - 3 pasos**

### **Paso 1:** Usa el componente oficial
```typescript
import { LoginForm } from '@/components/auth/LoginForm';
```

### **Paso 2:** Intégralo en tu página
```typescript
<LoginForm onSuccess={() => window.location.href = '/dashboard'} />
```

### **Paso 3:** O usa el hook para lógica personalizada
```typescript
const { user, login, logout, isAuthenticated } = useAuth();
```

**¡Eso es todo!** 🎉

---

## 🆘 **Solución de Problemas**

### **Error: "No estoy viendo usuarios en Firebase"**
- ✅ Verifica que estés en el proyecto correcto en Firebase Console
- ✅ Asegúrate de que Authentication esté habilitado
- ✅ Comprueba que Email/Password esté habilitado como proveedor

### **Error: "Las variables de entorno no funcionan"**
- ✅ Verifica que tu archivo `.env.local` tenga las variables correctas
- ✅ Reinicia el servidor de desarrollo (`npm run dev`)
- ✅ Las variables deben empezar con `NEXT_PUBLIC_`

### **Error: "El popup de Google se cierra solo"**
- ✅ Verifica que el dominio esté autorizado en Firebase Console
- ✅ Para localhost, asegúrate de que `localhost:3000` esté en dominios autorizados

### **Error de tipos TypeScript**
- ✅ Todos los tipos están en `src/types/auth.ts`
- ✅ Usa `AuthResult`, `LoginData`, `RegisterData` según necesites

---

### **¿Necesitas Ayuda?**

1. **Prueba primero:** `http://localhost:3000/login`
2. **Mira los ejemplos:** `src/components/auth/LoginForm.tsx`
3. **Revisa la consola:** F12 → Console (para ver errores)
4. **Firebase Console:** Para verificar usuarios creados

---

## 🎯 **Resumen para Desarrollo**

**Lo que YA está listo:**
- ✅ Firebase configurado
- ✅ Servicios de autenticación
- ✅ Hooks personalizados
- ✅ Tipos TypeScript
- ✅ Componente de login profesional
- ✅ Página oficial de login
- ✅ Integración con Google Auth

**Lo que TÚ tienes que hacer:**
1. Configurar `.env.local` con las credenciales
2. Usar `<LoginForm />` donde necesites login
3. Usar `useAuth()` para lógica personalizada
4. Customizar el diseño si es necesario

**¡Todo lo demás ya está hecho!** 🚀

---

## 💡 **Tips de Desarrollo**

- **Página oficial de login:** `/login`
- **Componente reutilizable:** `<LoginForm />`
- **Hook para lógica:** `useAuth()`
- **Los errores vienen traducidos** al español
- **El objeto `user`** tiene toda la info del usuario
- **Para desarrollo:** usa la página `/login`

¡Happy coding! 👨‍💻✨