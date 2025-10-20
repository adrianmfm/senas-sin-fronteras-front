/* eslint-disable @typescript-eslint/no-require-imports */
const WebSocket = require('ws');
const https = require('https');
const http = require('http');

// Configuración

// Función fetch compatible con Node.js
function fetchAPI(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            json: () => Promise.resolve(jsonData)
          });
        } catch (e) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            text: () => Promise.resolve(data)
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Configuración
const WS_PORT = 8080;
const PREDICTION_API_URL = 'http://localhost:8000'; // URL de tu API Flask

// Crear servidor WebSocket
const wss = new WebSocket.Server({ port: WS_PORT });

// Almacenar conexiones por tipo de cliente
const clients = {
  doctors: new Map(),
  patients: new Map()
};

// Almacenar sesiones activas
const sessions = new Map();

console.log(`🚀 Servidor WebSocket iniciado en puerto ${WS_PORT}`);
console.log(`📡 API de predicción configurada en: ${PREDICTION_API_URL}`);

// Función para verificar estado de la API Flask
async function checkAPIHealth() {
  try {
    await fetchAPI(`${PREDICTION_API_URL}/health`);
    console.log('✅ API Flask conectada');
    return true;
  } catch (error) {
    console.log('❌ API Flask desconectada:', error.message);
    return false;
  }
}

// Verificar estado de la API cada 30 segundos
setInterval(async () => {
  const isAPIConnected = await checkAPIHealth();
  
  // Notificar a todos los doctores sobre el estado de la API
  clients.doctors.forEach((doctor) => {
    doctor.ws.send(JSON.stringify({
      type: 'api_status',
      connected: isAPIConnected,
      timestamp: Date.now()
    }));
  });
}, 30000);

// Función para enviar predicción a la API Flask
async function getPrediction(sequence, threshold = 0.7) {
  try {
    console.log(`🔮 Enviando secuencia a API Flask: ${sequence.length} frames`);
    
    const response = await fetchAPI(`${PREDICTION_API_URL}/predict-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sequences: [sequence], // La API espera un array de secuencias
        threshold: threshold
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const predictions = await response.json();
    console.log(`✅ Predicción recibida:`, predictions);
    
    // La API devuelve un array, tomamos la primera predicción
    return predictions[0] || '';
  } catch (error) {
    console.error('❌ Error llamando a API de predicción:', error.message);
    return null;
  }
}

// Función para verificar estado de la API
async function checkAPIHealth() {
  try {
    const response = await fetchAPI(`${PREDICTION_API_URL}/health`);
    if (response.ok) {
      const health = await response.json();
      console.log('💚 API Flask funcionando:', health);
      return true;
    }
    return false;
  } catch (error) {
    console.log('💔 API Flask no disponible:', error.message);
    return false;
  }
}

// Verificar API al inicio
checkAPIHealth().then(isHealthy => {
  if (isHealthy) {
    console.log('✅ Conexión con API Flask establecida');
  } else {
    console.log('⚠️  API Flask no disponible - las predicciones no funcionarán');
  }
});

wss.on('connection', (ws, req) => {
  console.log(`🔗 Nueva conexión WebSocket desde ${req.socket.remoteAddress}`);
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Mensaje recibido:', message.type, message);

      switch (message.type) {
        case 'register':
          // Registrar cliente (doctor o paciente)
          if (message.clientType === 'doctor') {
            clients.doctors.set(message.id, {
              ws: ws,
              sessionId: message.sessionId,
              id: message.id
            });
            console.log(`👩‍⚕️ Doctor registrado: ${message.id} en sesión ${message.sessionId}`);
            
            // Confirmar registro
            ws.send(JSON.stringify({
              type: 'registered',
              clientType: 'doctor',
              id: message.id,
              sessionId: message.sessionId
            }));
            
            // Enviar estado actual de la API
            const isAPIConnected = await checkAPIHealth();
            ws.send(JSON.stringify({
              type: 'api_status',
              connected: isAPIConnected,
              timestamp: Date.now()
            }));
            
          } else if (message.clientType === 'patient') {
            clients.patients.set(message.id, {
              ws: ws,
              sessionId: message.sessionId,
              id: message.id
            });
            console.log(`👤 Paciente registrado: ${message.id} en sesión ${message.sessionId}`);
            
            // Confirmar registro
            ws.send(JSON.stringify({
              type: 'registered',
              clientType: 'patient',
              id: message.id,
              sessionId: message.sessionId
            }));
          }
          break;

        case 'frame_data':
          // Datos de keypoints del paciente
          console.log(`📊 Keypoints recibidos de paciente ${message.patientId}: ${message.sequence?.length} frames`);
          
          if (message.sequence && Array.isArray(message.sequence)) {
            try {
              // Enviar a API de predicción
              const prediction = await getPrediction(message.sequence);
              
              if (prediction && prediction.trim() !== '') {
                console.log(`🎯 Predicción obtenida: "${prediction}"`);
                
                // Enviar predicción a todos los doctores de la sesión
                clients.doctors.forEach((doctor) => {
                  if (doctor.sessionId === message.sessionId) {
                    console.log(`📤 Enviando predicción al doctor ${doctor.id}`);
                    doctor.ws.send(JSON.stringify({
                      type: 'prediction_result',
                      sessionId: message.sessionId,
                      patientId: message.patientId,
                      prediction: prediction,
                      timestamp: Date.now(),
                      confidence: 'high'
                    }));
                  }
                });
              } else {
                console.log('⚪ Sin predicción válida para esta secuencia');
              }
              
            } catch (predictionError) {
              console.error('❌ Error procesando predicción:', predictionError);
              
              // Enviar error a doctores
              clients.doctors.forEach((doctor) => {
                if (doctor.sessionId === message.sessionId) {
                  doctor.ws.send(JSON.stringify({
                    type: 'prediction_error',
                    sessionId: message.sessionId,
                    error: 'Error procesando predicción',
                    timestamp: Date.now()
                  }));
                }
              });
            }
          }
          break;

        case 'translation':
          // Traducción manual (si la hay)
          console.log(`📝 Traducción manual: ${message.text}`);
          
          // Reenviar a doctores de la sesión
          clients.doctors.forEach((doctor) => {
            if (doctor.sessionId === message.sessionId) {
              doctor.ws.send(JSON.stringify(message));
            }
          });
          break;

        default:
          console.log(`❓ Tipo de mensaje desconocido: ${message.type}`);
      }
      
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error procesando mensaje',
        timestamp: Date.now()
      }));
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`🔌 Conexión cerrada: código ${code}, razón: ${reason}`);
    
    // Limpiar cliente de las listas
    clients.doctors.forEach((doctor, id) => {
      if (doctor.ws === ws) {
        clients.doctors.delete(id);
        console.log(`👩‍⚕️ Doctor ${id} desconectado`);
      }
    });
    
    clients.patients.forEach((patient, id) => {
      if (patient.ws === ws) {
        clients.patients.delete(id);
        console.log(`👤 Paciente ${id} desconectado`);
      }
    });
  });

  ws.on('error', (error) => {
    console.error('❌ Error en WebSocket:', error);
  });
});

// Función para verificar estado de conexiones periódicamente
setInterval(() => {
  console.log(`📊 Estado del servidor:`);
  console.log(`   👩‍⚕️ Doctores conectados: ${clients.doctors.size}`);
  console.log(`   👤 Pacientes conectados: ${clients.patients.size}`);
  
  // Verificar API cada 30 segundos
  checkAPIHealth();
}, 30000);

// Manejo de errores del servidor
wss.on('error', (error) => {
  console.error('❌ Error del servidor WebSocket:', error);
});

console.log('🎯 Servidor listo para recibir conexiones...');
console.log('📋 Flujo de datos:');
console.log('   1. Paciente → WebSocket (keypoints)');
console.log('   2. WebSocket → Flask API (predicción)');
console.log('   3. Flask API → WebSocket → Doctor (resultado)');