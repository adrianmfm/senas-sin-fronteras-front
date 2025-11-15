import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

// Tipos para nuestro sistema
interface ClientInfo {
  id: string;
  type: 'patient' | 'doctor';
  ws: WebSocket;
  sessionId?: string;
}

interface KeypointsMessage {
  from: string;
  to: string;
  type: 'keypoints_sequence';
  data: number[][];
}

interface TranslationMessage {
  type: 'translation';
  sessionId: string;
  text: string;
  timestamp: number;
}

interface RegisterMessage {
  id: string;
  clientType: 'patient' | 'doctor';
  sessionId?: string;
}

// Mapa de clientes conectados
const clients = new Map<string, ClientInfo>();
const sessions = new Map<string, { patient: string; doctor: string }>();

// Función simulada para traducir keypoints a texto
function translateKeypoints(keypoints: number[][]): string {
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
function sendTranslationToDoctor(sessionId: string, translation: string) {
  const session = sessions.get(sessionId);
  if (!session) return;
  
  const doctorClient = clients.get(session.doctor);
  if (!doctorClient || doctorClient.ws.readyState !== WebSocket.OPEN) return;
  
  const message: TranslationMessage = {
    type: 'translation',
    sessionId,
    text: translation,
    timestamp: Date.now()
  };
  
  doctorClient.ws.send(JSON.stringify(message));
}

// Función para procesar keypoints del paciente
function processPatientKeypoints(clientId: string, message: KeypointsMessage) {
  const client = clients.get(clientId);
  if (!client || client.type !== 'patient') return;
  
  // Simular procesamiento de traducción
  const translation = translateKeypoints(message.data);
  
  // Enviar traducción al doctor de la misma sesión
  if (client.sessionId) {
    sendTranslationToDoctor(client.sessionId, translation);
  }
}

// Función para registrar un cliente
function registerClient(ws: WebSocket, data: RegisterMessage) {
  const { id, clientType, sessionId } = data;
  
  if (!id || !clientType) {
    ws.send(JSON.stringify({ error: 'ID y clientType son requeridos' }));
    return;
  }
  
  // Registrar cliente
  const clientInfo: ClientInfo = {
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
  
  console.log(`Cliente registrado: ${id} (${clientType}) en sesión: ${sessionId || 'ninguna'}`);
}

// Función para limpiar cliente desconectado
function cleanupClient(clientId: string) {
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
      }
    }
  }
  
  clients.delete(clientId);
  console.log(`Cliente desconectado: ${clientId}`);
}

// Crear servidor HTTP para WebSocket
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('Nueva conexión WebSocket');
  
  ws.on('message', (message: Buffer) => {
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
      console.error('Error procesando mensaje:', error);
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
    console.error('Error en WebSocket:', error);
  });
});

// Iniciar servidor en puerto 8080
const PORT = 8081;
server.listen(PORT, () => {
  console.log(`Servidor WebSocket ejecutándose en puerto ${PORT}`);
});

// Handler para Next.js (aunque el WebSocket se ejecuta independientemente)
export async function GET() {
  return new Response(JSON.stringify({
    message: 'Servidor WebSocket para traducción de lengua de señas',
    port: PORT,
    status: 'running'
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}