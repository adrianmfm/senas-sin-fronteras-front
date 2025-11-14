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

  const handleCreateSessionAndConnect = () => {
  const newSessionId = generateSessionId();
  const newDoctorId = `DOC-${user?.email?.split('@')[0] || 'doctor'}`;
  
  // Establecer estados
  setSessionId(newSessionId);
  setDoctorId(newDoctorId);
  
  // Conectar inmediatamente (ya que tenemos los valores)
  setIsConnected(true);
  
};

  const handleCreateSession = () => {
    
    const newSessionId = generateSessionId();
    
    setSessionId(newSessionId);
    
    // Establecer automáticamente el doctor ID si no está establecido
    if (!doctorId) {
      setDoctorId(`DOC-${user?.email?.split('@')[0] || 'doctor'}`);
    }

    // // Abrir automáticamente la ventana del paciente con el sessionId
    // const patientUrl = `/patient?sessionId=${newSessionId}&autoConnect=true`;
    // window.open(patientUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
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
                 Comenzar Nueva Consulta
            </h2>
            <p className="text-green-700 mb-4">
              Inicia una nueva consulta médica con traducción de lengua de señas en tiempo real.
            </p>
            <div className="bg-green-100 rounded-md p-3 mb-4">
              <p className="text-sm text-green-800">
                <strong>¿Cómo funciona?</strong> Al hacer clic, podrás comunicarte directamente 
                con tu paciente. Luego podrás abrir la cámara del paciente desde el botón 
                &quot;Abrir Cámara Paciente&quot; en la interfaz principal.
              </p>
            </div>
            <button
              onClick={handleCreateSessionAndConnect}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Iniciar consulta
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}