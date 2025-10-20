# Configuración de Variables de Entorno

## Firebase Configuration

Para configurar Firebase en el proyecto, necesitas crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id_aqui
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id_aqui
```

## Configuración

1. Copia el archivo `.env.example` y renómbralo a `.env.local`
2. Reemplaza los valores de ejemplo con tus credenciales reales de Firebase
3. Reinicia el servidor de desarrollo (`npm run dev`) para que los cambios tomen efecto

## Servicios Habilitados

El proyecto está configurado para usar:

- ✅ **Firebase Authentication** - Login/registro de usuarios
- ✅ **Firebase Firestore** - Base de datos para perfiles de usuario
- ✅ **Firebase Analytics** - Métricas de uso (opcional)

## Testing

Para probar que la configuración funciona correctamente:

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000/login`
3. Prueba el registro y login de usuarios

## Nota importante

- Las variables que comienzan con `NEXT_PUBLIC_` están disponibles en el lado del cliente
- El archivo `.env.local` está incluido en `.gitignore` y no se subirá al repositorio
- Nunca subas credenciales reales al repositorio público
- Para desarrollo colaborativo, comparte las credenciales de forma segura (no por Git)