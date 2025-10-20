// Exportaciones principales para Firebase Auth
export { AuthService } from './authService';
export { useAuth } from '@/hooks/useAuth';
export { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
export { LoginForm } from '@/components/auth/LoginForm';
export { SimpleLoginExample } from '@/components/auth/SimpleLoginExample';
export type { AuthResult, LoginData, RegisterData, AuthContextType, UserProfile } from '@/types/auth';

// Exportaciones para el servicio de predicción
export { PredictionService, predictionService } from './predictionService';
export type { PredictionRequest, PredictionResponse, HealthResponse } from './predictionService';