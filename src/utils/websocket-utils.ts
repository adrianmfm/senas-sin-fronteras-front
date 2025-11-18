// Utilidad para manejo robusto de errores WebSocket
export interface WebSocketErrorDetails {
  timestamp: string;
  eventType: string;
  readyState?: number;
  readyStateText?: string;
  note?: string;
}

export function createWebSocketErrorHandler(
  componentName: string,
  setConnected: (connected: boolean) => void,
  setConnectionError?: (error: string | null) => void
) {
  return (event: Event) => {
    // Manejo más robusto del error WebSocket
    let errorMessage = 'Error de conexión WebSocket';
    let isWarning = false; // Distinguir entre errores y advertencias
    const errorDetails: Record<string, string | number> = {
      timestamp: new Date().toISOString(),
      eventType: event.type || 'unknown'
    };
    
    // Intentar obtener información del WebSocket de forma segura
    try {
      const ws = event.target as WebSocket;
      if (ws && typeof ws.readyState === 'number') {
        errorDetails.readyState = ws.readyState;
        errorDetails.readyStateText = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState] || 'UNKNOWN';
        
        // Mensaje específico según el estado
        switch (ws.readyState) {
          case WebSocket.CONNECTING:
            errorMessage = 'Error al conectar con el servidor WebSocket';
            break;
          case WebSocket.CLOSED:
            errorMessage = 'Conexión WebSocket cerrada';
            isWarning = true; // Esto es normal cuando se cierra la página
            break;
          default:
            errorMessage = 'Error durante la comunicación WebSocket';
        }
      }
    } catch {
      errorDetails.note = 'No se pudo obtener información del WebSocket';
    }
    
    // Usar console.warn para eventos normales, console.error para errores reales
    if (isWarning) {
      console.warn(`⚠️ WebSocket (${componentName}) cerrado:`, errorMessage);
    } else {
      console.error(`❌ Error en WebSocket (${componentName}):`, errorMessage);
    }
    
    if (errorDetails && Object.keys(errorDetails).length > 0) {
      console.info('📋 Detalles:', errorDetails);
    }
    
    setConnected(false);
    
    if (setConnectionError) {
      setConnectionError(errorMessage);
    }
    
    // Solo mostrar advertencia sobre el servidor si es un error real de conexión
    if (!isWarning) {
      console.warn('🔍 Verificar que el servidor WebSocket esté ejecutándose en puerto 8080');
    }
  };
}

// Función para obtener descripción del estado WebSocket
export function getWebSocketStateDescription(readyState: number): string {
  switch (readyState) {
    case WebSocket.CONNECTING:
      return 'CONNECTING (0) - Conectando al servidor';
    case WebSocket.OPEN:
      return 'OPEN (1) - Conexión establecida';
    case WebSocket.CLOSING:
      return 'CLOSING (2) - Cerrando conexión';
    case WebSocket.CLOSED:
      return 'CLOSED (3) - Conexión cerrada';
    default:
      return `UNKNOWN (${readyState}) - Estado desconocido`;
  }
}

// Función para verificar si WebSocket está en estado utilizable
export function isWebSocketUsable(ws: WebSocket | null): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

// Función para cerrar WebSocket de forma segura
export function safeCloseWebSocket(ws: WebSocket | null): void {
  try {
    if (ws && ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
      ws.close(1000, 'Cerrando conexión limpiamente');
    }
  } catch (error) {
    console.warn('Error al cerrar WebSocket:', error);
  }
}