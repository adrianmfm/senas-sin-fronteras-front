'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ← Importación correcta
import DoctorInterface from '@/components/DoctorInterface';
import { useAuth } from '@/services';
import { Plus, Copy, Check } from 'lucide-react';

export default function DoctorPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const router = useRouter(); // ← Usar el hook correctamente
  const { user, loading } = useAuth(); // ← Agregar loading

  // Generar ID de sesión único
  const generateSessionId = () => {
    const prefix = 'SES';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  };

  const handleCreateSession = () => {
    const newSessionId = generateSessionId();
    
    setSessionId(newSessionId);
    
    // Establecer automáticamente el doctor ID si no está establecido
    if (!doctorId) {
      setDoctorId(`DOC-${user?.email?.split('@')[0] || 'doctor'}`);
    }

    // Abrir automáticamente la ventana del paciente con el sessionId
    const patientUrl = `/patient?sessionId=${newSessionId}&autoConnect=true`;
    window.open(patientUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

  const handleConnect = () => {
    if (doctorId.trim() && sessionId.trim()) {
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSessionId(text);
      setTimeout(() => setCopiedSessionId(null), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  useEffect(() => {
    // Solo redirigir si no está cargando y no hay usuario
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (el useEffect redirigirá)
  if (!user) {
    return null;
  }

  if (isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <DoctorInterface 
          doctorId={doctorId}
          sessionId={sessionId}
          onDisconnect={handleDisconnect}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Panel del Doctor
          </h1>
          <p className="text-gray-600">
            Sistema de Traducción de Lengua de Señas
          </p>
          <p className="text-sm text-green-600 mt-2">
            Bienvenido, {user.email}
          </p>
        </div>

          {/* Panel de creación de sesiones */}
        <div className="space-y-6">
          {/* Botón para crear nueva sesión */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Crear Nueva Sesión
            </h2>
            <p className="text-green-700 mb-4">
              Crea una nueva sesión y abre automáticamente la ventana del paciente conectada.
            </p>
            <div className="bg-green-100 rounded-md p-3 mb-4">
              <p className="text-sm text-green-800">
                <strong>Al hacer clic:</strong> Se generará un ID único y se abrirá una nueva ventana 
                para el paciente ya conectada automáticamente. ¡No necesita copiar ni compartir nada!
              </p>
            </div>
            <button
              onClick={handleCreateSession}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Sesión + Abrir Ventana del Paciente
            </button>
          </div>

          {/* Mostrar sesión actual si existe */}
          {sessionId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Sesión Activa
              </h3>
              <div className="bg-white rounded-md p-4 border border-blue-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ID de Sesión:</p>
                    <p className="font-mono text-lg font-bold text-blue-800">{sessionId}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sessionId)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    {copiedSessionId === sessionId ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <p className="text-sm text-blue-700">
                  <strong>Estado de la sesión:</strong>
                </p>
                <div className="bg-blue-100 rounded-md p-3">
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>✅ <strong>Sesión creada:</strong> {sessionId}</p>
                    <p>✅ <strong>Ventana del paciente:</strong> Abierta automáticamente</p>
                    <p>✅ <strong>Conexión:</strong> Establecida sin configuración manual</p>
                    <p>🟡 <strong>Esperando:</strong> Inicio de la consulta</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={!doctorId.trim() || !sessionId.trim()}
                className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Iniciar Sesión de Consulta
              </button>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            💡 Cómo funciona (Modo Automático)
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Crear Sesión:</strong> Genera ID único y abre ventana del paciente automáticamente</li>
            <li>• <strong>Sin configuración manual:</strong> El paciente ya estará conectado en la nueva ventana</li>
            <li>• <strong>Traducción automática:</strong> Las señas se traducen en tiempo real</li>
            <li>• <strong>Comunicación directa:</strong> Ambas ventanas están sincronizadas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}