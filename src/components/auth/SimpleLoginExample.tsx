'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';

export const SimpleLoginExample = () => {
  const { user, isAuthenticated } = useAuth();

  // Si está autenticado, mostrar dashboard simple
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              ¡Bienvenido!
            </h2>
            <div className="text-gray-600 space-y-1">
              <p><strong>Email:</strong> {user?.email}</p>
              {user?.displayName && (
                <p><strong>Nombre:</strong> {user?.displayName}</p>
              )}
              <p className="text-sm text-gray-500">
                ¡Tu sesión está activa! Usa el menú superior para navegar.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
              ¿Qué quieres hacer?
            </h3>
            
            <button
              onClick={() => window.location.href = '/patient'}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg flex items-center justify-center gap-3"
            >
              � <span>Soy Paciente</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/doctor'}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center gap-3"
            >
              � <span>Soy Doctor</span>
            </button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                💡 <strong>Tip:</strong> Usa el menú superior para cerrar sesión o navegar entre secciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar formulario de login
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