'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { useEffect } from 'react';

export const LoginPageWrapper = () => {
  const { user } = useAuth();

  // Redirigir automáticamente si ya está autenticado
  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  // Si ya está autenticado, mostrar mensaje de carga
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Señas Sin Fronteras
          </h1>
          <p className="text-gray-600">
            Plataforma de traducción de lengua de señas
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
};