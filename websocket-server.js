#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

// Servidor WebSocket independiente para el sistema de traducción de lengua de señas
const { WebSocketServer } = require('ws');
const { createServer } = require('http');

// Tipos simulados con JSDoc
/**
 * @typedef {Object} ClientInfo
 * @property {string} id
 * @property {'patient'|'doctor'} type
 * @property {WebSocket} ws
 * @property {string} [sessionId]
 */

/**
 * @typedef {Object} KeypointsMessage
 * @property {string} from
 * @property {string} to
 * @property {'keypoints_sequence'} type
 * @property {number[][]} data
 */

/**
 * @typedef {Object} TranslationMessage
 * @property {'translation'} type
 * @property {string} sessionId
 * @property {string} text
 * @property {number} timestamp
 */

/**
 * @typedef {Object} RegisterMessage
 * @property {string} id
 * @property {'patient'|'doctor'} clientType
 * @property {string} [sessionId]
 */

// Mapa de clientes conectados
/** @type {Map<string, ClientInfo>} */
const clients = new Map();

/** @type {Map<string, {patient: string, doctor: string}>} */
const sessions = new Map();

// Función simulada para traducir keypoints a texto
function translateKeypoints(keypoints) {
  // Simulamos diferentes traducciones basadas en características de los keypoints
  const sequences = [
    "Hola", 
    "Gracias", 
    "Por favor",
    "Lo siento",
    "Ayuda",
    "Agua",
    "Dolor",
    "Medicina",
    "Doctor",
    "Bien"
  ];
  
  // Usamos una lógica simple basada en la suma de algunos keypoints para determinar la "palabra"
  const sum = keypoints.flat().reduce((acc, val) => acc + val, 0);
  const index = Math.floor(Math.abs(sum * 1000) % sequences.length);
  
  return sequences[index];
}

// Función para enviar traducción al doctor
function sendTranslationToDoctor(sessionId, translation) {
  const session = sessions.get(sessionId);
  if (!session) return;
  
  const doctorClient = clients.get(session.doctor);
  if (!doctorClient || doctorClient.ws.readyState !== 1) return; // 1 = OPEN
  
  /** @type {TranslationMessage} */
  const message = {
    type: 'translation',
    sessionId,
    text: translation,
    timestamp: Date.now()
  };
  
  doctorClient.ws.send(JSON.stringify(message));
  console.log(`📤 Traducción enviada al doctor ${session.doctor}: "${translation}"`);
}

// Función para procesar keypoints del paciente
function processPatientKeypoints(clientId, message) {
  const client = clients.get(clientId);
  if (!client || client.type !== 'patient') return;
  
  console.log(`🔍 Procesando keypoints del paciente ${clientId}`);
  
  // Simular procesamiento de traducción
  const translation = translateKeypoints(message.data);
  
  // Enviar traducción al doctor de la misma sesión
  if (client.sessionId) {
    sendTranslationToDoctor(client.sessionId, translation);
  }
}

// Función para registrar un cliente
function registerClient(ws, data) {
  const { id, clientType, sessionId } = data;
  
  if (!id || !clientType) {
    ws.send(JSON.stringify({ error: 'ID y clientType son requeridos' }));
    return;
  }
  
  // Registrar cliente
  /** @type {ClientInfo} */
  const clientInfo = {
    id,
    type: clientType,
    ws,
    sessionId
  };
  
  clients.set(id, clientInfo);
  
  // Si es una sesión, actualizar el mapa de sesiones
  if (sessionId) {
    let session = sessions.get(sessionId);
    if (!session) {
      session = { patient: '', doctor: '' };
      sessions.set(sessionId, session);
    }
    
    if (clientType === 'patient') {
      session.patient = id;
    } else if (clientType === 'doctor') {
      session.doctor = id;
    }
  }
  
  ws.send(JSON.stringify({
    type: 'registered',
    id,
    sessionId,
    message: `Cliente ${clientType} registrado exitosamente`
  }));
  
  console.log(`✅ Cliente registrado: ${id} (${clientType}) en sesión: ${sessionId || 'ninguna'}`);
}

// Función para limpiar cliente desconectado
function cleanupClient(clientId) {
  const client = clients.get(clientId);
  if (!client) return;
  
  // Limpiar de sesiones si es necesario
  if (client.sessionId) {
    const session = sessions.get(client.sessionId);
    if (session) {
      if (session.patient === clientId) {
        session.patient = '';
      } else if (session.doctor === clientId) {
        session.doctor = '';
      }
      
      // Si la sesión está vacía, eliminarla
      if (!session.patient && !session.doctor) {
        sessions.delete(client.sessionId);
        console.log(`🗑️ Sesión ${client.sessionId} eliminada`);
      }
    }
  }
  
  clients.delete(clientId);
  console.log(`❌ Cliente desconectado: ${clientId}`);
}

// Crear servidor HTTP para WebSocket
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('🔗 Nueva conexión WebSocket');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'register':
          registerClient(ws, data);
          break;
          
        case 'keypoints_sequence':
          processPatientKeypoints(data.from, data);
          break;
          
        default:
          ws.send(JSON.stringify({ error: 'Tipo de mensaje desconocido' }));
      }
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
      ws.send(JSON.stringify({ error: 'Error procesando mensaje' }));
    }
  });
  
  ws.on('close', () => {
    // Encontrar y limpiar el cliente que se desconectó
    for (const [clientId, client] of clients.entries()) {
      if (client.ws === ws) {
        cleanupClient(clientId);
        break;
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ Error en WebSocket:', error);
  });
});

// Iniciar servidor en puerto 8080
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🚀 Servidor WebSocket ejecutándose en puerto ${PORT}`);
  console.log(`📡 Los clientes pueden conectarse a: ws://localhost:${PORT}`);
  console.log('🎯 Sistema de traducción de lengua de señas iniciado');
});

// Mostrar estadísticas cada 30 segundos
setInterval(() => {
  console.log(`📊 Estadísticas: ${clients.size} clientes conectados, ${sessions.size} sesiones activas`);
}, 30000);