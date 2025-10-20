'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { generateSimulatedKeypoints, normalizeFrames } from '@/utils/keypoints-helpers';

const TARGET_FRAME_COUNT = 15;

interface Props {
  patientId: string;
  sessionId: string;
  onStop?: () => void;
}

interface KeypointsMessage {
  from: string;
  to: string;
  type: 'keypoints_sequence';
  data: number[][];
}

const PatientCameraSimple: React.FC<Props> = ({ patientId, sessionId, onStop }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [translationCount, setTranslationCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const frameBuffer = useRef<number[][]>([]);

  // Simular el procesamiento de frames
  const processSimulatedFrame = useCallback(() => {
    if (webcamRef.current?.video && isProcessing) {
      const video = webcamRef.current.video;
      
      if (video.readyState === 4) {
        // Dibujar el video en el canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Dibujar puntos simulados (opcional, para visualización)
            ctx.fillStyle = 'red';
            for (let i = 0; i < 10; i++) {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height;
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
        
        // Generar keypoints simulados
        const keypoints = generateSimulatedKeypoints();
        frameBuffer.current.push(keypoints);

        if (frameBuffer.current.length >= TARGET_FRAME_COUNT) {
          // Enviar la secuencia cuando tengamos suficientes frames
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message: KeypointsMessage = {
              from: patientId,
              to: 'modelo',
              type: 'keypoints_sequence',
              data: frameBuffer.current.slice() // Copiar el array
            };
            
            wsRef.current.send(JSON.stringify(message));
            setTranslationCount(prev => prev + 1);
            frameBuffer.current = []; // Limpiar buffer
          }
        }
      }
      
      // Continuar la animación
      animationFrameRef.current = requestAnimationFrame(processSimulatedFrame);
    }
  }, [patientId, isProcessing]);

  // Conectar WebSocket
  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:8080');
    
    wsRef.current.onopen = () => {
      setConnected(true);
      // Registrarse como paciente
      wsRef.current?.send(JSON.stringify({ 
        type: 'register', 
        id: patientId,
        clientType: 'patient',
        sessionId: sessionId
      }));
    };
    
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log('Mensaje del servidor:', msg);
    };
    
    wsRef.current.onclose = () => {
      setConnected(false);
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
        console.warn('⚠️ WebSocket del paciente (simple) cerrado:', errorMessage);
      } else {
        console.error('❌ Error en WebSocket del paciente (simple):', errorMessage);
      }
      
      if (errorDetails && Object.keys(errorDetails).length > 0) {
        console.info('📋 Detalles:', errorDetails);
      }
      setConnected(false);
      
      // Log adicional para debug
      console.warn('Verificar que el servidor WebSocket esté ejecutándose en puerto 8080');
    };

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      wsRef.current?.close();
    };
  }, [patientId, sessionId]);

  // Iniciar procesamiento automático cuando esté conectado
  useEffect(() => {
    if (connected && !isProcessing) {
      setIsProcessing(true);
      processSimulatedFrame();
    } else if (!connected && isProcessing) {
      setIsProcessing(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [connected, isProcessing, processSimulatedFrame]);

  const handleStop = () => {
    setIsProcessing(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    wsRef.current?.close();
    onStop?.();
  };

  return (
    <div className="relative w-[640px] h-[480px] rounded-xl overflow-hidden shadow-xl border border-gray-700">
      <Webcam 
        ref={webcamRef} 
        width={640} 
        height={480} 
        audio={false} 
        className="rounded-xl" 
      />
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        className="absolute top-0 left-0" 
      />
      
      {/* Indicadores de estado */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-black/60 px-3 py-1 rounded-md text-sm text-white">
          {connected ? "🟢 WS Conectado" : "🔴 Desconectado"}
        </div>
        <div className="bg-black/60 px-3 py-1 rounded-md text-sm text-white">
          📊 Secuencias: {translationCount}
        </div>
        <div className="bg-black/60 px-3 py-1 rounded-md text-sm text-white">
          👤 {patientId}
        </div>
        <div className="bg-black/60 px-3 py-1 rounded-md text-sm text-white">
          🏥 {sessionId}
        </div>
        <div className="bg-orange-600/80 px-3 py-1 rounded-md text-sm text-white">
          🔄 Simulación
        </div>
      </div>

      {/* Botón de detener */}
      <button
        onClick={handleStop}
        className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
      >
        ⏹️ Detener
      </button>

      {/* Información del modo simulación */}
      <div className="absolute bottom-20 left-4 right-4 bg-orange-100/90 border border-orange-300 rounded-lg p-3">
        <h4 className="font-semibold text-orange-800 text-sm mb-1">
          ℹ️ Modo Simulación Activo
        </h4>
        <p className="text-xs text-orange-700">
          MediaPipe no disponible. Se están generando keypoints simulados para demostrar la funcionalidad del WebSocket.
          Las traducciones funcionarán normalmente.
        </p>
      </div>
    </div>
  );
};

export default PatientCameraSimple;