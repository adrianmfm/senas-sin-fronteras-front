# 🤖 Guía de Integración de Modelo Personalizado

## 📋 Resumen del Sistema

Tu sistema de traducción de lengua de señas en tiempo real está **completamente funcional** con:

- ✅ **Servidor WebSocket** funcionando
- ✅ **Interfaz del Paciente** con MediaPipe o simulación
- ✅ **Interfaz del Doctor** con reconexión automática
- ✅ **Comunicación en tiempo real** entre pacientes y doctores
- ✅ **Manejo robusto de errores** 

## 🎯 Integrar tu Modelo Personalizado

### 1. **Ubicación del código a modificar**

El archivo que necesitas modificar es: `websocket-server.js`

Busca la función `translateKeypoints()` (línea ~15-25):

```javascript
// AQUÍ ES DONDE INTEGRAS TU MODELO
function translateKeypoints(keypoints) {
  // TODO: Aquí vas a integrar tu modelo real
  // keypoints es un array de arrays con las coordenadas: [[x1,y1,z1,...], [x2,y2,z2,...], ...]
  
  // EJEMPLO DE INTEGRACIÓN:
  /*
  const prediction = await yourModel.predict(keypoints);
  return prediction.text || "Traducción no disponible";
  */
  
  // Simulación actual - REEMPLAZAR CON TU MODELO
  const phrases = [
    "Hola doctor", "Me duele aquí", "Necesito ayuda", 
    "Gracias", "¿Cómo está?", "Hasta luego",
    "Por favor", "Entiendo", "No entiendo"
  ];
  
  return phrases[Math.floor(Math.random() * phrases.length)];
}
```

### 2. **Pasos para integrar tu modelo**

#### Opción A: Modelo en Python con spawn
```javascript
const { spawn } = require('child_process');

function translateKeypoints(keypoints) {
  return new Promise((resolve) => {
    // Ejecutar tu script de Python
    const python = spawn('python3', ['path/to/tu_modelo.py']);
    
    // Enviar keypoints como JSON
    python.stdin.write(JSON.stringify(keypoints));
    python.stdin.end();
    
    let result = '';
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.on('close', () => {
      resolve(result.trim() || "Sin traducción");
    });
  });
}
```

#### Opción B: Modelo como API REST
```javascript
const axios = require('axios'); // npm install axios

async function translateKeypoints(keypoints) {
  try {
    const response = await axios.post('http://localhost:5000/predict', {
      keypoints: keypoints
    });
    
    return response.data.translation || "Sin traducción";
  } catch (error) {
    console.error('Error en predicción:', error);
    return "Error en traducción";
  }
}
```

#### Opción C: Modelo en Node.js directo
```javascript
// Si tienes tu modelo convertido a ONNX o TensorFlow.js
const tf = require('@tensorflow/tfjs-node');

let model = null;

// Cargar modelo una vez al iniciar
async function loadModel() {
  model = await tf.loadLayersModel('path/to/your/model.json');
}

function translateKeypoints(keypoints) {
  if (!model) return "Modelo no cargado";
  
  try {
    // Preprocesar keypoints según tu modelo
    const tensor = tf.tensor(keypoints);
    const prediction = model.predict(tensor);
    
    // Postprocesar resultado
    const result = prediction.dataSync();
    return convertPredictionToText(result);
  } catch (error) {
    console.error('Error en predicción:', error);
    return "Error en traducción";
  }
}
```

### 3. **Formato de datos de entrada**

Los keypoints que recibes tienen esta estructura:

```javascript
// keypoints = Array de frames (secuencia temporal)
// Cada frame contiene:
[
  // Frame 1: [pose (33*3), face (468*3), leftHand (21*3), rightHand (21*3)]
  [x1, y1, z1, x2, y2, z2, ..., x1629, y1629, z1629], // 543 puntos * 3 coords = 1629 valores
  
  // Frame 2:
  [x1, y1, z1, x2, y2, z2, ..., x1629, y1629, z1629],
  
  // ... hasta 30 frames (TARGET_FRAME_COUNT)
]
```

**Distribución de keypoints por frame:**
- **Pose**: posiciones 0-98 (33 puntos × 3 coordenadas)
- **Face**: posiciones 99-1502 (468 puntos × 3 coordenadas)  
- **Mano izquierda**: posiciones 1503-1565 (21 puntos × 3 coordenadas)
- **Mano derecha**: posiciones 1566-1628 (21 puntos × 3 coordenadas)

### 4. **Ejemplo completo de integración**

```javascript
// websocket-server.js - Función modificada
async function translateKeypoints(keypoints) {
  try {
    // Log para debug (opcional)
    console.log(`Traduciendo secuencia de ${keypoints.length} frames`);
    
    // AQUÍ VA TU MODELO - Ejemplo con API
    const response = await fetch('http://localhost:5000/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sequence: keypoints,
        metadata: {
          frameCount: keypoints.length,
          timestamp: Date.now()
        }
      })
    });
    
    const result = await response.json();
    return result.translation || "No se pudo traducir";
    
  } catch (error) {
    console.error('Error en traducción:', error);
    return "Error en el sistema de traducción";
  }
}

// Y modificar en el message handler para usar async:
if (data.type === 'keypoints_sequence') {
  console.log(`📊 Secuencia recibida de ${data.from}: ${data.data.length} frames`);
  
  // Usar await para la traducción
  const translation = await translateKeypoints(data.data);
  
  // Enviar a todos los doctores...
  // (resto del código igual)
}
```

## 🚀 Pasos Siguientes

1. **Identifica tu tipo de modelo** (Python script, API, TensorFlow.js, etc.)
2. **Modifica la función `translateKeypoints()`** según el ejemplo correspondiente
3. **Instala dependencias adicionales** si es necesario (`axios`, `@tensorflow/tfjs-node`, etc.)
4. **Prueba con datos reales** usando la interfaz del paciente
5. **Ajusta el preprocesamiento** de keypoints según necesites

## 🔧 Comandos para probar

```bash
# Terminal 1: Servidor WebSocket
cd /Users/adrian/Desktop/next/next-app
node websocket-server.js

# Terminal 2: Servidor Next.js  
cd /Users/adrian/Desktop/next/next-app
npm run dev

# Abrir en navegador:
# - Paciente: http://localhost:3000/patient
# - Doctor: http://localhost:3000/doctor
```

## ❓ ¿Necesitas ayuda específica?

- **Formato de datos**: Los keypoints están normalizados (0-1) por MediaPipe
- **Frecuencia**: Se envía una secuencia cada 30 frames (~1 segundo)
- **Rendimiento**: El servidor puede manejar múltiples sesiones simultáneas
- **Escalabilidad**: Fácil de integrar con bases de datos o logs

¡Tu sistema está listo para integrar cualquier modelo de ML! 🎉