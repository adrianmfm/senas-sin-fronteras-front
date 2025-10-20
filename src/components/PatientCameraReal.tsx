/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { 
  extractKeypointsForModel, 
  thereHand, 
  normalizeFrames, 
  generateSimulatedKeypoints
} from '@/utils/keypoints-helpers';

const TARGET_FRAME_COUNT = 15;

interface Props {
  patientId: string;
  sessionId: string;
  onStop?: () => void;
}

// Hook para cargar MediaPipe dinámicamente solo en el cliente
const useMediaPipe = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [MediaPipe, setMediaPipe] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Cargar MediaPipe dinámicamente solo en el cliente
      Promise.all([
        import('@mediapipe/holistic'),
        import('@mediapipe/camera_utils'),
        import('@mediapipe/drawing_utils')
      ]).then(([holistic, camera, drawing]) => {
        setMediaPipe({
          Holistic: holistic.Holistic,
          Camera: camera.Camera,
          drawConnectors: drawing.drawConnectors,
          HAND_CONNECTIONS: holistic.HAND_CONNECTIONS,
          //POSE_CONNECTIONS: holistic.POSE_CONNECTIONS,
          //FACEMESH_TESSELATION: holistic.FACEMESH_TESSELATION
        });
        setIsLoaded(true);
      }).catch((error) => {
        console.warn('MediaPipe no disponible, usando modo simulación:', error);
        setIsLoaded(false);
      });
    }
  }, []);

  return { isLoaded, MediaPipe };
};

const PatientCameraReal: React.FC<Props> = ({ patientId, sessionId, onStop }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holisticRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [connected, setConnected] = useState(false);
  const [translationCount, setTranslationCount] = useState(0);
  const [processingMode, setProcessingMode] = useState<'loading' | 'mediapipe' | 'simulation'>('loading');
  const [isHolisticActive, setIsHolisticActive] = useState(false);
  const [isIntentionalClose, setIsIntentionalClose] = useState(false);

  const { isLoaded, MediaPipe } = useMediaPipe();
  const frameBuffer = useRef<number[][]>([]);

  const sendSequence = useCallback(async (sequence: number[][]) => {
    // Send to WebSocket for doctor communication
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'frame_data',
        patientId,
        sessionId,
        sequence
      };
      wsRef.current.send(JSON.stringify(message));
      setTranslationCount(prev => prev + 1);
      console.log('� Secuencia enviada al doctor:', sequence.length, 'frames');
    }

    // Note: Predictions are now handled by the doctor, not the patient
  }, [patientId, sessionId]);

  // Callback de resultados de MediaPipe (igual que tu código original)
  const onResults = useCallback((results: any) => {
    // Verificar que holistic sigue activo antes de procesar
    if (!isHolisticActive) {
      return;
    }
    
    if (canvasRef.current && MediaPipe) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.poseLandmarks && MediaPipe.POSE_CONNECTIONS) {
          MediaPipe.drawConnectors(ctx, results.poseLandmarks, MediaPipe.POSE_CONNECTIONS, { 
            color: '#00FF00', 
            lineWidth: 2 
          });
        }
        if (results.leftHandLandmarks && MediaPipe.HAND_CONNECTIONS) {
          MediaPipe.drawConnectors(ctx, results.leftHandLandmarks, MediaPipe.HAND_CONNECTIONS, { 
            color: '#FF0000', 
            lineWidth: 2 
          });
        }
        if (results.rightHandLandmarks && MediaPipe.HAND_CONNECTIONS) {
          MediaPipe.drawConnectors(ctx, results.rightHandLandmarks, MediaPipe.HAND_CONNECTIONS, { 
            color: '#0000FF', 
            lineWidth: 2 
          });
        }
        if (results.faceLandmarks && MediaPipe.FACEMESH_TESSELATION) {
          MediaPipe.drawConnectors(ctx, results.faceLandmarks, MediaPipe.FACEMESH_TESSELATION, { 
            color: '#FFFF00', 
            lineWidth: 1 
          });
        }

        ctx.restore();
      }
    }

    if (thereHand(results)) {
      const kp = extractKeypointsForModel(results);
      frameBuffer.current.push(kp);

      if (frameBuffer.current.length >= TARGET_FRAME_COUNT) {
        const sequence = normalizeFrames(frameBuffer.current, TARGET_FRAME_COUNT);
        sendSequence(sequence);
        frameBuffer.current = [];
      }
    }
  }, [MediaPipe, sendSequence, isHolisticActive]);

  // Procesamiento simulado cuando MediaPipe no está disponible
  const processSimulatedFrame = useCallback(() => {
    if (webcamRef.current?.video && processingMode === 'simulation') {
      const video = webcamRef.current.video;
      
      if (video.readyState === 4) {
        // Dibujar el video en el canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Agregar indicadores visuales simulados
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.strokeRect(100, 100, 200, 150);
            
            ctx.strokeStyle = '#FF0000';
            ctx.strokeRect(50, 50, 80, 80);
            
            ctx.strokeStyle = '#0000FF';
            ctx.strokeRect(400, 60, 80, 80);
            
            ctx.fillStyle = '#FFFF00';
            ctx.font = '16px Arial';
            ctx.fillText('🤖 Modo Simulación', 10, 30);
          }
        }
        
        // Simular detección de gestos
        if (Math.random() > 0.95) {
          const kp = generateSimulatedKeypoints();
          frameBuffer.current.push(kp);

          if (frameBuffer.current.length >= TARGET_FRAME_COUNT) {
            const sequence = normalizeFrames(frameBuffer.current, TARGET_FRAME_COUNT);
            sendSequence(sequence);
            frameBuffer.current = [];
          }
        }
      }
    }
    
    if (processingMode === 'simulation') {
      animationFrameRef.current = requestAnimationFrame(processSimulatedFrame);
    }
  }, [processingMode, sendSequence]);

  // WebSocket connection with improved error handling and debugging
  useEffect(() => {
    console.log('🔌 Intentando conectar WebSocket...', { patientId, sessionId });
    
    try {
      wsRef.current = new WebSocket('ws://localhost:8080');
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket conectado exitosamente');
        setConnected(true);
        const registerMessage = { 
          type: 'register', 
          id: patientId,
          clientType: 'patient',
          sessionId: sessionId
        };
        console.log('📤 Enviando registro:', registerMessage);
        wsRef.current?.send(JSON.stringify(registerMessage));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('📥 Mensaje del servidor:', msg);
        } catch (error) {
          console.error('❌ Error parseando mensaje del servidor:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket cerrado:', { 
          code: event.code, 
          reason: event.reason, 
          wasClean: event.wasClean,
          intentional: isIntentionalClose 
        });
        setConnected(false);
        setIsIntentionalClose(false); // Reset the flag after closing
      };
      
      wsRef.current.onerror = (event) => {
        // Skip error logging if this is an intentional close
        if (isIntentionalClose) {
          console.log('🔕 Error ignorado (cierre intencional)');
          return;
        }
        
        // Manejo más robusto del error WebSocket
        let errorMessage = 'Error de conexión WebSocket';
        let isWarning = false; // Distinguir entre errores y advertencias
        const errorDetails: Record<string, string | number> = {
          timestamp: new Date().toISOString(),
          eventType: event.type || 'unknown',
          url: 'ws://localhost:8080'
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
          console.warn('⚠️ WebSocket del paciente cerrado:', errorMessage);
        } else {
          console.error('❌ Error en WebSocket del paciente:', errorMessage);
        }
        
        if (errorDetails && Object.keys(errorDetails).length > 0) {
          console.info('📋 Detalles:', errorDetails);
        }
        setConnected(false);
        
        // Diagnóstico adicional
        console.warn('🔍 Verificaciones recomendadas:');
        console.warn('  1. Servidor WebSocket en puerto 8080:', 'lsof -i :8080');
        console.warn('  2. Firewall o antivirus bloqueando conexión');
        console.warn('  3. Otra aplicación usando el puerto');
      };

    } catch (error) {
      console.error('❌ Error creando WebSocket:', error);
      setConnected(false);
    }

    return () => {
      if (wsRef.current) {
        console.log('🧹 Limpiando WebSocket...');
        wsRef.current.close();
      }
    };
  }, [patientId, sessionId, isIntentionalClose]);

  // Inicializar MediaPipe o modo simulación
  useEffect(() => {
    if (isLoaded && MediaPipe) {
      // MediaPipe está disponible, usar código real
      setProcessingMode('mediapipe');
      
      const holistic = new MediaPipe.Holistic({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });
      
      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      
      holistic.onResults(onResults);
      holisticRef.current = holistic;
      setIsHolisticActive(true); // Marcar como activo

      const startMediaPipeCamera = () => {
        if (webcamRef.current?.video) {
          const cam = new MediaPipe.Camera(webcamRef.current.video, {
            onFrame: async () => {
              if (holisticRef.current && webcamRef.current?.video) {
                await holisticRef.current.send({ image: webcamRef.current.video });
              }
            },
            width: 640,
            height: 480,
          });
          cameraRef.current = cam;
          cam.start();
        }
      };

      const checkVideoReady = () => {
        if (webcamRef.current?.video?.readyState === 4) {
          startMediaPipeCamera();
        } else {
          setTimeout(checkVideoReady, 100);
        }
      };

      checkVideoReady();

      return () => {
        // Marcar holistic como inactivo primero
        setIsHolisticActive(false);
        
        // Verificar que holistic existe y no ha sido cerrado antes de intentar cerrarlo
        try {
          if (holistic && typeof holistic.close === 'function') {
            holistic.close();
          }
        } catch (error) {
          console.warn('Error al cerrar holistic (ya puede estar cerrado):', error);
        }
        
        // Limpiar referencia
        holisticRef.current = null;
        
        // Detener la cámara de forma segura
        try {
          if (cameraRef.current && typeof cameraRef.current.stop === 'function') {
            cameraRef.current.stop();
          }
        } catch (error) {
          console.warn('Error al detener la cámara:', error);
        }
        
        // Limpiar referencia de cámara
        cameraRef.current = null;
      };
    } else if (isLoaded === false) {
      // MediaPipe no está disponible, usar simulación
      setProcessingMode('simulation');
      
      const startSimulation = () => {
        if (webcamRef.current?.video?.readyState === 4) {
          processSimulatedFrame();
        } else {
          setTimeout(startSimulation, 100);
        }
      };

      startSimulation();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isLoaded, MediaPipe, onResults, processSimulatedFrame]);

  const handleStop = () => {
    // Marcar holistic como inactivo primero
    setIsHolisticActive(false);
    
    // Detener animaciones
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Cerrar cámara MediaPipe de forma segura
    try {
      if (cameraRef.current && typeof cameraRef.current.stop === 'function') {
        cameraRef.current.stop();
      }
    } catch (error) {
      console.warn('Error al detener la cámara:', error);
    }
    
    // Cerrar holistic de forma segura
    try {
      if (holisticRef.current && typeof holisticRef.current.close === 'function') {
        holisticRef.current.close();
      }
    } catch (error) {
      console.warn('Error al cerrar holistic:', error);
    }
    
    // Limpiar referencias
    holisticRef.current = null;
    cameraRef.current = null;
    
    // Set flag before closing WebSocket to prevent error logging
    setIsIntentionalClose(true);
    wsRef.current?.close();
    onStop?.();
  };

  const getModeDisplay = () => {
    switch (processingMode) {
      case 'loading': return '⏳ Cargando...';
      case 'mediapipe': return '🤖 MediaPipe ON';
      case 'simulation': return '🔄 Simulación';
      default: return '❓ Desconocido';
    }
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
           {patientId}
        </div>
        <div className="bg-black/60 px-3 py-1 rounded-md text-sm text-white">
          🏥 {sessionId}
        </div>
        <div className={`px-3 py-1 rounded-md text-sm text-white ${
          processingMode === 'mediapipe' ? 'bg-green-600/80' :
          processingMode === 'simulation' ? 'bg-orange-600/80' : 'bg-gray-600/80'
        }`}>
          {getModeDisplay()}
        </div>
      </div>

      <button
        onClick={handleStop}
        className="absolute bottom-4 right-4 px-5 py-2 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition-all"
      >
        ✖ Detener
      </button>

      {/* Información del modo actual */}
      {processingMode === 'simulation' && (
        <div className="absolute bottom-20 left-4 right-4 bg-orange-100/90 border border-orange-300 rounded-lg p-3">
          <p className="text-xs text-orange-700">
            ⚠️ MediaPipe no disponible. Usando keypoints simulados para demostrar funcionalidad.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientCameraReal;