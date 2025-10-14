# Sistema de Traducción de Lengua de Señas en Tiempo Real

Este proyecto implementa un sistema completo de traducción de lengua de señas en tiempo real usando Next.js, WebSockets y MediaPipe.

## 🚀 Características

- **Captura en tiempo real**: Detecta keypoints de manos, pose y rostro usando MediaPipe
- **Comunicación WebSocket**: Conexión en tiempo real entre pacientes y doctores
- **Traducción automática**: Convierte secuencias de gestos a texto
- **Interfaz separada**: Portales distintos para pacientes y doctores
- **Sesiones múltiples**: Soporte para múltiples pacientes y doctores simultáneos

## 🏗️ Arquitectura

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Paciente      │ ◄─────────────► │   Servidor WS   │
│   (Envía        │                 │   (Puerto 8080) │
│   keypoints)    │                 │                 │
└─────────────────┘                 └─────────────────┘
                                             ▲
                                             │ WebSocket
                                             ▼
┌─────────────────┐                 ┌─────────────────┐
│   Doctor        │ ◄─────────────► │   Next.js App   │
│   (Recibe       │                 │   (Puerto 3000) │
│   traducciones) │                 │                 │
└─────────────────┘                 └─────────────────┘
```

## 📋 Requisitos Previos

- Node.js 18 o superior
- Cámara web
- Navegador moderno con soporte para WebRTC

## 🔧 Instalación

1. **Clonar e instalar dependencias**:
```bash
cd next-app
npm install
```

2. **Ejecutar el sistema completo**:
```bash
# Opción 1: Ejecutar todo en un comando
npm run dev:full

# Opción 2: Ejecutar por separado (en terminales diferentes)
# Terminal 1 - Servidor WebSocket
npm run websocket

# Terminal 2 - Aplicación Next.js
npm run dev
```

3. **Acceder a la aplicación**:
   - Aplicación principal: http://localhost:3000
   - Portal del paciente: http://localhost:3000/patient
   - Portal del doctor: http://localhost:3000/doctor

## 👥 Guía de Uso

### Para el Paciente

1. Ir a http://localhost:3000/patient
2. Ingresar un ID único de paciente (ej: `paciente001`)
3. Ingresar un ID de sesión compartido con el doctor (ej: `sesion001`)
4. Hacer clic en "Iniciar Captura de Gestos"
5. Permitir acceso a la cámara cuando se solicite
6. Realizar gestos con las manos frente a la cámara

### Para el Doctor

1. Ir a http://localhost:3000/doctor
2. Ingresar un ID único de doctor (ej: `doctor001`)
3. Ingresar el **mismo ID de sesión** que el paciente (ej: `sesion001`)
4. Hacer clic en "Conectar a Sesión"
5. Las traducciones aparecerán automáticamente cuando el paciente haga gestos

### Coordinación entre Paciente y Doctor

**Importante**: Ambos usuarios deben usar el **mismo ID de sesión** para que funcione la comunicación.

Ejemplo de configuración:
- Paciente: ID = `paciente001`, Sesión = `consulta_123`
- Doctor: ID = `doctor001`, Sesión = `consulta_123`

## 🔍 Componentes del Sistema

### Frontend

- **`PatientCamera.tsx`**: Componente que captura keypoints usando MediaPipe
- **`DoctorInterface.tsx`**: Interfaz para recibir traducciones en tiempo real
- **`/patient`**: Página del portal del paciente
- **`/doctor`**: Página del portal del doctor

### Backend

- **`websocket-server.js`**: Servidor WebSocket independiente que maneja:
  - Registro de clientes (pacientes/doctores)
  - Procesamiento de keypoints
  - Traducción simulada
  - Envío de traducciones al doctor correspondiente

### Flujo de Datos

1. **Paciente**: MediaPipe captura keypoints → Normaliza secuencia → Envía via WebSocket
2. **Servidor**: Recibe keypoints → Traduce a texto → Identifica doctor de la sesión
3. **Doctor**: Recibe traducción via WebSocket → Muestra en interfaz

## 🛠️ Funciones de Traducción

El sistema incluye una función simulada que traduce keypoints a palabras comunes:

```javascript
const sequences = [
  "Hola", "Gracias", "Por favor", "Lo siento", "Ayuda",
  "Agua", "Dolor", "Medicina", "Doctor", "Bien"
];
```

Para implementar traducción real, reemplazar la función `translateKeypoints` en `websocket-server.js` con:
- Modelo de machine learning entrenado
- API externa de traducción
- Algoritmo de procesamiento de gestos personalizado

## 🔧 Configuración Avanzada

### Cambiar Puerto del WebSocket

Editar en `websocket-server.js`:
```javascript
const PORT = 8080; // Cambiar aquí
```

Y actualizar la URL en los componentes React:
```javascript
wsRef.current = new WebSocket('ws://localhost:NUEVO_PUERTO');
```

### Personalizar Detección de MediaPipe

En `PatientCamera.tsx`, ajustar opciones:
```javascript
holistic.setOptions({
  modelComplexity: 1,        // 0, 1, o 2
  smoothLandmarks: true,     // Suavizado
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
```

### Modificar Secuencias de Frames

Cambiar el número de frames capturados:
```javascript
const TARGET_FRAME_COUNT = 15; // Ajustar aquí
```

## 🚨 Solución de Problemas

### Error de Conexión WebSocket

1. Verificar que el servidor WebSocket esté ejecutándose:
```bash
npm run websocket
```

2. Comprobar que el puerto 8080 esté disponible
3. Revisar la consola del navegador para errores

### Cámara No Funciona

1. Verificar permisos de cámara en el navegador
2. Usar HTTPS en producción (requerido para WebRTC)
3. Comprobar que la cámara no esté siendo usada por otra aplicación

### Traducciones No Aparecen

1. Verificar que paciente y doctor usen el **mismo ID de sesión**
2. Comprobar conexión WebSocket en ambos clientes
3. Revisar logs del servidor WebSocket

## 📱 Producción

Para desplegar en producción:

1. **Configurar variables de entorno**:
```bash
# .env.local
NEXT_PUBLIC_WS_URL=wss://tu-dominio.com
WS_PORT=8080
```

2. **Usar HTTPS**: Requerido para acceso a cámara
3. **Configurar proxy reverso**: Para servir WebSocket y Next.js desde el mismo dominio

## 🤝 Contribuir

1. Fork del repositorio
2. Crear branch para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.

---

🌟 **Sistema desarrollado para mejorar la comunicación médica inclusiva**
