/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Helpers para extracción de keypoints compatible con el pipeline de Python/MediaPipe
 * Basado en el código Python de entrenamiento del modelo
 */

// Constantes que deben coincidir con el código Python
export const POSE_LANDMARKS_COUNT = 33;
export const FACE_LANDMARKS_COUNT = 468;
export const HAND_LANDMARKS_COUNT = 21;

// Coordenadas por landmark (x, y, z)
export const COORDINATES_PER_LANDMARK = 3;

// Total de keypoints por frame
export const TOTAL_KEYPOINTS = 
  (POSE_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK) +
  (FACE_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK) +
  (HAND_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK * 2); // 2 manos

/**
 * Extrae keypoints de MediaPipe Holistic results en el mismo formato que Python
 * @param results - Resultado de MediaPipe Holistic
 * @returns Array de keypoints [pose, face, leftHand, rightHand] aplanado
 */
// Constantes para el modelo específico (126 características)
export const MODEL_FEATURES_COUNT = 126;
export const MODEL_FRAMES_COUNT = 30;

// Función para extraer keypoints reducidos (solo manos - 126 características) compatible con tu modelo
export function extractKeypointsForModel(results: any): number[] {
  const features: number[] = [];
  
  // Solo usar keypoints de las MANOS (no cara ni pose)
  const importantHandIndices = [0, 4, 8, 12, 16, 5, 9, 13, 17]; // Muñeca + tips de dedos + nudillos base
  
  // 1. MANO IZQUIERDA (9 puntos × 3 = 27 características)
  if (results.leftHandLandmarks && results.leftHandLandmarks.length > 0) {
    for (const idx of importantHandIndices) {
      const landmark = results.leftHandLandmarks[idx];
      if (landmark) {
        features.push(landmark.x || 0, landmark.y || 0, landmark.z || 0);
      } else {
        features.push(0, 0, 0);
      }
    }
  } else {
    // Rellenar con zeros si no hay mano izquierda (27 características)
    for (let i = 0; i < importantHandIndices.length * COORDINATES_PER_LANDMARK; i++) {
      features.push(0);
    }
  }
  
  // 2. MANO DERECHA (9 puntos × 3 = 27 características)
  if (results.rightHandLandmarks && results.rightHandLandmarks.length > 0) {
    for (const idx of importantHandIndices) {
      const landmark = results.rightHandLandmarks[idx];
      if (landmark) {
        features.push(landmark.x || 0, landmark.y || 0, landmark.z || 0);
      } else {
        features.push(0, 0, 0);
      }
    }
  } else {
    // Rellenar con zeros si no hay mano derecha (27 características)
    for (let i = 0; i < importantHandIndices.length * COORDINATES_PER_LANDMARK; i++) {
      features.push(0);
    }
  }
  
  // 3. CARACTERÍSTICAS ADICIONALES DE POSE RELEVANTES PARA SEÑAS (solo torso/brazos - SIN CARA)
  // Solo incluimos puntos del torso y brazos que son importantes para el lenguaje de señas
  const importantPoseIndices = [
    11, 12,  // Hombros
    13, 14,  // Codos
    15, 16,  // Muñecas
    17, 18,  // Meñiques
    19, 20,  // Índices
    21, 22,  // Pulgares
    23, 24   // Cadera (estabilidad) - SIN incluir nariz ni otros puntos faciales
  ];
  
  if (results.poseLandmarks && results.poseLandmarks.length > 0) {
    for (const idx of importantPoseIndices) {
      const landmark = results.poseLandmarks[idx];
      if (landmark) {
        features.push(landmark.x || 0, landmark.y || 0, landmark.z || 0);
      } else {
        features.push(0, 0, 0);
      }
    }
  } else {
    // Rellenar con zeros si no hay pose (42 características: 14 puntos × 3)
    for (let i = 0; i < importantPoseIndices.length * COORDINATES_PER_LANDMARK; i++) {
      features.push(0);
    }
  }
  
  // Total: 27 (mano izq) + 27 (mano der) + 42 (pose sin cara) = 96 características
  // Agregar 30 características adicionales para llegar a 126
  const additionalFeatures = new Array(MODEL_FEATURES_COUNT - features.length).fill(0);
  features.push(...additionalFeatures);
  
  console.log(`🎯 Keypoints extraídos (SIN CARA - solo manos + pose): ${features.length} características (esperado: ${MODEL_FEATURES_COUNT})`);
  
  // Verificar que tenemos exactamente 126 características
  if (features.length !== MODEL_FEATURES_COUNT) {
    console.warn(`⚠️ Tamaño incorrecto: ${features.length} vs ${MODEL_FEATURES_COUNT}`);
    // Ajustar al tamaño correcto
    if (features.length > MODEL_FEATURES_COUNT) {
      return features.slice(0, MODEL_FEATURES_COUNT);
    } else {
      const padding = new Array(MODEL_FEATURES_COUNT - features.length).fill(0);
      return features.concat(padding);
    }
  }
  
  return features;
}

// Función original para mantener compatibilidad
export function extractKeypoints(results: any): number[] {
  // Extraer pose keypoints (33 landmarks * 3 coordinates = 99 values)
  const pose = results.poseLandmarks
    ? results.poseLandmarks.flatMap((landmark: any) => [
        landmark.x || 0,
        landmark.y || 0,
        landmark.z || 0
      ])
    : new Array(POSE_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK).fill(0);

  // Extraer face keypoints (468 landmarks * 3 coordinates = 1404 values)
  const face = results.faceLandmarks
    ? results.faceLandmarks.flatMap((landmark: any) => [
        landmark.x || 0,
        landmark.y || 0,
        landmark.z || 0
      ])
    : new Array(FACE_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK).fill(0);

  // Extraer left hand keypoints (21 landmarks * 3 coordinates = 63 values)
  const leftHand = results.leftHandLandmarks
    ? results.leftHandLandmarks.flatMap((landmark: any) => [
        landmark.x || 0,
        landmark.y || 0,
        landmark.z || 0
      ])
    : new Array(HAND_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK).fill(0);

  // Extraer right hand keypoints (21 landmarks * 3 coordinates = 63 values)
  const rightHand = results.rightHandLandmarks
    ? results.rightHandLandmarks.flatMap((landmark: any) => [
        landmark.x || 0,
        landmark.y || 0,
        landmark.z || 0
      ])
    : new Array(HAND_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK).fill(0);

  // Combinar todos los keypoints en el orden correcto (pose + face + leftHand + rightHand)
  return [...pose, ...face, ...leftHand, ...rightHand];
}

/**
 * Verifica si hay detección de manos en los resultados
 * @param results - Resultado de MediaPipe Holistic
 * @returns true si se detectaron manos
 */
export function thereHand(results: any): boolean {
  return !!(results.leftHandLandmarks || results.rightHandLandmarks);
}

/**
 * Normaliza una secuencia de frames a un número específico de frames
 * Interpolación para ajustar la longitud de la secuencia
 * @param frames - Array de frames con keypoints
 * @param targetCount - Número objetivo de frames
 * @returns Array normalizado con targetCount frames
 */
export function normalizeFrames(frames: number[][], targetCount: number): number[][] {
  const currentCount = frames.length;
  
  if (currentCount === targetCount) {
    return frames;
  }
  
  const normalized: number[][] = [];
  
  // Crear índices para interpolar
  const indices = Array.from({ length: targetCount }, (_, i) =>
    Math.floor((i * currentCount) / targetCount)
  );
  
  // Seleccionar frames según los índices calculados
  for (const idx of indices) {
    normalized.push(frames[idx]);
  }
  
  return normalized;
}

/**
 * Valida que un frame de keypoints tenga la estructura correcta
 * @param keypoints - Array de keypoints de un frame
 * @returns true si el formato es válido
 */
export function validateKeypointsFrame(keypoints: number[]): boolean {
  return keypoints.length === TOTAL_KEYPOINTS;
}

/**
 * Genera keypoints simulados para testing (mantiene la estructura correcta)
 * @returns Array de keypoints simulados con el formato correcto
 */
export function generateSimulatedKeypoints(): number[] {
  // Simular pose (33 landmarks)
  const pose = Array.from({ length: POSE_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK }, 
    () => Math.random() * 0.8 + 0.1);
  
  // Simular face (468 landmarks)
  const face = Array.from({ length: FACE_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK }, 
    () => Math.random() * 0.6 + 0.2);
  
  // Simular left hand (21 landmarks)
  const leftHand = Array.from({ length: HAND_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK }, 
    () => Math.random() * 0.4 + 0.3);
  
  // Simular right hand (21 landmarks)
  const rightHand = Array.from({ length: HAND_LANDMARKS_COUNT * COORDINATES_PER_LANDMARK }, 
    () => Math.random() * 0.4 + 0.3);
  
  return [...pose, ...face, ...leftHand, ...rightHand];
}