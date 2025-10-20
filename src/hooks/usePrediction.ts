import { useState, useCallback, useRef, useEffect } from 'react';
import { predictionService, type HealthResponse } from '@/services/predictionService';
import { normalizeFrames } from '@/utils/keypoints-helpers';

export interface UsePredictionOptions {
  threshold?: number;
  autoConnect?: boolean;
  maxSequenceLength?: number;
  minSequenceLength?: number;
}

export interface PredictionState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastPrediction: string | null;
  modelInfo: HealthResponse | null;
  sequenceCount: number;
}

export function usePrediction(options: UsePredictionOptions = {}) {
  const {
    threshold = 0.7,
    autoConnect = true,
    maxSequenceLength = 50,
    minSequenceLength = 10
  } = options;

  const [state, setState] = useState<PredictionState>({
    isConnected: false,
    isLoading: false,
    error: null,
    lastPrediction: null,
    modelInfo: null,
    sequenceCount: 0
  });

  const sequenceBuffer = useRef<number[][]>([]);
  const isProcessing = useRef(false);

  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const healthInfo = await predictionService.checkHealth();
      setState(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        modelInfo: healthInfo,
        error: null
      }));
      
      console.log('✅ Conectado a API de predicción:', healthInfo);
      return healthInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: errorMessage
      }));
      
      console.error('❌ Error conectando a API de predicción:', error);
      throw error;
    }
  }, []);

  // Verificar conexión con la API al montar
  useEffect(() => {
    if (autoConnect) {
      checkConnection();
    }
  }, [autoConnect, checkConnection]);

  const addFrame = useCallback((keypoints: number[]) => {
    if (!state.isConnected || isProcessing.current) {
      return;
    }

    sequenceBuffer.current.push(keypoints);

    // Mantener buffer dentro de límites
    if (sequenceBuffer.current.length > maxSequenceLength) {
      sequenceBuffer.current.shift(); // Remover frame más antiguo
    }

    console.log(`📊 Frame agregado: ${sequenceBuffer.current.length}/${maxSequenceLength} frames`);
  }, [state.isConnected, maxSequenceLength]);

  const predictCurrentSequence = useCallback(async (): Promise<string | null> => {
    if (!state.isConnected || isProcessing.current || sequenceBuffer.current.length < minSequenceLength) {
      console.log('⏸️ Predicción omitida:', {
        connected: state.isConnected,
        processing: isProcessing.current,
        frames: sequenceBuffer.current.length,
        minRequired: minSequenceLength
      });
      return null;
    }

    isProcessing.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Normalizar secuencia al número de frames esperado por el modelo
      const modelFrames = state.modelInfo?.model_frames || 30;
      const normalizedSequence = normalizeFrames([...sequenceBuffer.current], modelFrames);
      
      console.log('🔮 Procesando secuencia:', {
        originalFrames: sequenceBuffer.current.length,
        normalizedFrames: normalizedSequence.length,
        modelExpected: modelFrames,
        featuresPerFrame: normalizedSequence[0]?.length || 0
      });

      const prediction = await predictionService.predictSingle(normalizedSequence, threshold);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastPrediction: prediction,
        sequenceCount: prev.sequenceCount + 1,
        error: null
      }));

      // Limpiar buffer después de predicción exitosa
      sequenceBuffer.current = [];
      
      console.log(`✅ Predicción completada:`, prediction || '(sin resultado)');
      return prediction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en predicción';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      console.error('❌ Error en predicción:', error);
      return null;
    } finally {
      isProcessing.current = false;
    }
  }, [state.isConnected, state.modelInfo, threshold, minSequenceLength]);

  const predictSequence = useCallback(async (sequence: number[][]): Promise<string | null> => {
    if (!state.isConnected) {
      console.warn('⚠️ API de predicción no conectada, omitiendo predicción');
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Validar secuencia
      const validation = predictionService.validateSequence(sequence);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Normalizar secuencia
      const modelFrames = state.modelInfo?.model_frames || 30;
      const normalizedSequence = normalizeFrames(sequence, modelFrames);
      
      const prediction = await predictionService.predictSingle(normalizedSequence, threshold);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastPrediction: prediction,
        sequenceCount: prev.sequenceCount + 1,
        error: null
      }));

      return prediction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en predicción';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [state.isConnected, state.modelInfo, threshold]);

  const clearBuffer = useCallback(() => {
    sequenceBuffer.current = [];
    console.log('🧹 Buffer de secuencia limpiado');
  }, []);

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      modelInfo: null,
      error: null
    }));
    clearBuffer();
  }, [clearBuffer]);

  return {
    // Estado
    ...state,
    
    // Información del buffer
    currentFrameCount: sequenceBuffer.current.length,
    maxFrames: maxSequenceLength,
    minFrames: minSequenceLength,
    canPredict: sequenceBuffer.current.length >= minSequenceLength && state.isConnected,
    
    // Métodos
    checkConnection,
    addFrame,
    predictCurrentSequence,
    predictSequence,
    clearBuffer,
    resetError,
    disconnect
  };
}