// Servicio para conectar con la API de predicción Flask
export interface PredictionRequest {
  sequences: number[][][]; // Array de secuencias, donde cada secuencia es un array de frames con keypoints
  threshold?: number;      // Umbral de confianza (por defecto 0.7)
}

export interface PredictionResponse {
  predictions: string[];   // Array de palabras predichas (una por secuencia)
  status: 'success' | 'error';
  message?: string;
}

export interface HealthResponse {
  status: string;
  model_frames: number;
  features: number | null;
  num_classes: number;
}

export class PredictionService {
  private static readonly DEFAULT_BASE_URL = 'http://localhost:8080';
  private static readonly DEFAULT_THRESHOLD = 0.7;
  
  private baseUrl: string;

  constructor(baseUrl: string = PredictionService.DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Verifica el estado de la API y obtiene información del modelo
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error checking API health:', error);
      throw error;
    }
  }

  /**
   * Envía una secuencia de keypoints para predicción
   * @param sequence Array de frames con keypoints [frame1, frame2, ...]
   * @param threshold Umbral de confianza (0.0 - 1.0)
   */
  async predictSingle(
    sequence: number[][], 
    threshold: number = PredictionService.DEFAULT_THRESHOLD
  ): Promise<string> {
    const predictions = await this.predictBatch([sequence], threshold);
    return predictions[0] || '';
  }

  /**
   * Envía múltiples secuencias para predicción en lote
   * @param sequences Array de secuencias, donde cada secuencia es un array de frames
   * @param threshold Umbral de confianza (0.0 - 1.0)
   */
  async predictBatch(
    sequences: number[][][], 
    threshold: number = PredictionService.DEFAULT_THRESHOLD
  ): Promise<string[]> {
    try {
      console.log(`🔮 Enviando ${sequences.length} secuencias para predicción...`, {
        sequences: sequences.length,
        firstSequenceFrames: sequences[0]?.length || 0,
        firstFrameFeatures: sequences[0]?.[0]?.length || 0,
        threshold
      });

      const requestBody: PredictionRequest = {
        sequences,
        threshold
      };

      const response = await fetch(`${this.baseUrl}/predict-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Prediction failed: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const predictions: string[] = await response.json();
      
      console.log('✅ Predicciones recibidas:', {
        predictions,
        count: predictions.length,
        validPredictions: predictions.filter(p => p && p.trim() !== '').length
      });

      return predictions;
    } catch (error) {
      console.error('❌ Error en predicción:', error);
      throw error;
    }
  }

  /**
   * Validación de secuencia antes de enviar
   */
  validateSequence(sequence: number[][]): { isValid: boolean; error?: string } {
    if (!sequence || sequence.length === 0) {
      return { isValid: false, error: 'Secuencia vacía' };
    }

    if (!Array.isArray(sequence[0])) {
      return { isValid: false, error: 'Formato de frame inválido' };
    }

    const firstFrameLength = sequence[0].length;
    const inconsistentFrame = sequence.find(frame => frame.length !== firstFrameLength);
    
    if (inconsistentFrame) {
      return { 
        isValid: false, 
        error: `Frames con longitudes inconsistentes: esperado ${firstFrameLength}, encontrado ${inconsistentFrame.length}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Configurar nueva URL base para la API
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Obtener URL base actual
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Instancia por defecto del servicio
export const predictionService = new PredictionService();