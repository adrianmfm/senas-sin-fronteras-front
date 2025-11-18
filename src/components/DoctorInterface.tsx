import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  doctorId: string;
  sessionId: string;
  onDisconnect: () => void;
}

interface Translation {
  id: string;
  text: string;
  timestamp: number;
}

interface TranslationMessage {
  text: string;
  timestamp: number;
}

const DoctorInterface: React.FC<Props> = ({ doctorId, sessionId, onDisconnect }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const patientWindowRef = useRef<Window | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [lastTranslation, setLastTranslation] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const translationsEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPatientWindowOpen, setIsPatientWindowOpen] = useState(false);


  const scrollToBottom = () => {
    translationsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  // Función para verificar si la ventana del paciente sigue abierta
  const checkPatientWindow = useCallback(() => {
    if (patientWindowRef.current && patientWindowRef.current.closed) {
      patientWindowRef.current = null;
      setIsPatientWindowOpen(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkPatientWindow, 1000);
    return () => clearInterval(interval);
  }, [checkPatientWindow]);


  const openPatientWindow = () => {
    // Si ya hay una ventana abierta, enfocarla en lugar de abrir otra
    if (patientWindowRef.current && !patientWindowRef.current.closed) {
      patientWindowRef.current.focus();
      return;
    }

    // Abrir nueva ventana del paciente
    const patientUrl = `/patient?sessionId=${sessionId}&autoConnect=true`;
    const newWindow = window.open(patientUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');

    if (newWindow) {
      patientWindowRef.current = newWindow;
      setIsPatientWindowOpen(true);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [translations]);

  const connectWebSocket = useCallback(() => {
    try {
      setConnectionError(null);

      // Limpiar timeout anterior si existe
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      wsRef.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || '');

      wsRef.current.onopen = () => {
        setConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);

        // Registrarse como doctor
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'register',
            id: doctorId,
            clientType: 'doctor',
            sessionId: sessionId
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Mensaje del servidor:', data);
          if (data.type === 'phrase_result') {
            const text = data.text || data.phraseText || '(sin texto)';
            const newTranslation: Translation = {
              id: `${data.timestamp}-${Math.random()}`,
              text,
              timestamp: data.timestamp
            };
            setTranslations(prev => [...prev, newTranslation]);
            setLastTranslation(text);
          }
          else if (data.type === 'frame_data') {
          } else if (data.type === 'prediction_result') {
            // Predicción ya procesada por el servidor WebSocket
            console.log('🤖 Predicción recibida del servidor:', data.prediction);
            const newTranslation: Translation = {
              id: `pred-${data.timestamp}-${Math.random()}`,
              text: `🤖 ${data.prediction}`,
              timestamp: data.timestamp
            };
            setTranslations(prev => [...prev, newTranslation]);
            setLastTranslation(`🤖 ${data.prediction}`);
          } else if (data.type === 'registered') {
            console.log('Doctor registrado exitosamente:', data);
          }
        } catch (parseError) {
          console.warn('Error parseando mensaje del servidor:', parseError);
        }
      };

      wsRef.current.onclose = (event) => {
        setConnected(false);

        // Solo intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && reconnectAttempts < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          setConnectionError(`Conexión perdida. Reintentando en ${delay / 1000}s...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, delay);
        } else if (reconnectAttempts >= 5) {
          setConnectionError('No se pudo conectar después de varios intentos');
        }
      };

      wsRef.current.onerror = (event) => {
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
          console.warn('⚠️ WebSocket del doctor cerrado:', errorMessage);
        } else {
          console.error('❌ Error en WebSocket del doctor:', errorMessage);
        }

        if (errorDetails && Object.keys(errorDetails).length > 0) {
          console.info('📋 Detalles:', errorDetails);
        }
        setConnected(false);
        setConnectionError(errorMessage);
      };

    } catch (error) {
      console.error('Error creando WebSocket:', error);
      setConnectionError('No se pudo crear la conexión WebSocket');
    }
  }, [doctorId, sessionId, reconnectAttempts]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      // Limpiar timeout al desmontar
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Cerrar conexión limpiamente
      if (wsRef.current) {
        wsRef.current.close(1000, 'Componente desmontado');
      }
    };
  }, [connectWebSocket]);

  const handleDisconnect = () => {
    // Limpiar timeout de reconexión si existe
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    // Cerrar WebSocket solo si está abierto
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Desconexión manual');
    }
    setConnected(false);
    setConnectionError('Desconectado manualmente');
    onDisconnect?.();
  };

  const clearTranslations = () => {
    setTranslations([]);
    setLastTranslation('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Panel del Doctor
          </h1>
          <p className="text-gray-600">
            Doctor: <span className="font-semibold">{doctorId}</span>
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Botón para reabrir la cámara del paciente - solo mostrar si no está abierta */}
          {!isPatientWindowOpen && (
            <button
              onClick={openPatientWindow}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer"
            >
              Abrir Cámara
            </button>
          )}

          {/* Botón de reconexión manual */}
          {!connected && (
            <button
              onClick={connectWebSocket}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              🔄 Reconectar
            </button>
          )}

          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            Desconectar
          </button>
        </div>
      </div>

      {/* Error de conexión */}
      {connectionError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {connectionError}
            </div>
            {!connected && (
              <button
                onClick={connectWebSocket}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
          {connectionError.includes('Error al conectar') && (
            <p className="text-xs mt-2 text-red-600">
              💡 Asegúrate de que el servidor WebSocket esté ejecutándose en el puerto 8080
            </p>
          )}
        </div>
      )}

      {/* Última traducción destacada */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Última Traducción
        </h2>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <p className="text-2xl font-bold text-blue-900">
            {lastTranslation || 'Esperando traducción...'}
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700">Total Traducciones</h3>
          <p className="text-2xl font-bold text-gray-900">{translations.length}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700">Conexión</h3>
          <p className={`text-lg font-semibold ${connected ? 'text-green-600' : 'text-red-600'
            }`}>
            {connected ? 'Activo' : 'Inactivo'}
          </p>
        </div>


        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700">Última Actualización</h3>
          <p className="text-lg font-semibold text-gray-900">
            {translations.length > 0
              ? formatTime(translations[translations.length - 1].timestamp)
              : 'N/A'
            }
          </p>
        </div>
      </div>

      {/* Historial de traducciones */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-700">
            Historial de Traducciones
          </h2>
          <button
            onClick={clearTranslations}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
          >
            Limpiar Historial
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto border">
          {translations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">👋</div>
                <p>No hay traducciones aún</p>
                <p className="text-sm">Esperando que el paciente comience a hacer gestos...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {translations.map((translation) => (
                <div
                  key={translation.id}
                  className="bg-white p-3 rounded-md shadow-sm border-l-4 border-blue-400"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-gray-800 font-medium">
                      {translation.text}
                    </p>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {formatTime(translation.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={translationsEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Información de ayuda */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          ℹ️ Información
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Las traducciones aparecen automáticamente cuando el paciente hace gestos</li>
          <li>• El historial se actualiza en tiempo real</li>
          <li>• Use &quot;Limpiar Historial&quot; para empezar de nuevo</li>
        </ul>
      </div>
    </div>
  );
};

export default DoctorInterface;