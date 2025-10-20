'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PatientCameraSimple from '@/components/PatientCameraSimple';
import PatientCameraReal from '@/components/PatientCameraReal';

export default function PatientPage() {
  const [isActive, setIsActive] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [useRealMediaPipe, setUseRealMediaPipe] = useState(true);
  const [isAutoConnected, setIsAutoConnected] = useState(false);
  
  const searchParams = useSearchParams();

  // Detectar si viene de auto-conexión del doctor
  useEffect(() => {
    const urlSessionId = searchParams.get('sessionId');
    const autoConnect = searchParams.get('autoConnect');
    
    if (urlSessionId && autoConnect === 'true') {
      setSessionId(urlSessionId);
      setPatientId(`PAC-${Date.now().toString(36)}`); // Generar ID automático
      setIsAutoConnected(true);
      setIsActive(true); // Conectar automáticamente
    }
  }, [searchParams]);

  const handleStart = () => {
    if (patientId.trim() && sessionId.trim()) {
      setIsActive(true);
    }
  };

  const handleStop = () => {
    setIsActive(false);
  };

  if (isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {isAutoConnected ? 'Conectado Automáticamente' : 'Sistema de Traducción - Paciente'}
          </h1>
          
          {isAutoConnected && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-800 font-semibold">✅ Sesión Iniciada por el Doctor</p>
              <p className="text-green-700 text-sm mt-1">
                ID de Sesión: <span className="font-mono">{sessionId}</span>
              </p>
              <p className="text-green-600 text-sm mt-2">
                Su cámara está lista para detectar señas
              </p>
            </div>
          )}
          
          {/* Alternar entre componentes */}
          <div className="mb-4">
            <button
              onClick={() => setUseRealMediaPipe(!useRealMediaPipe)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {useRealMediaPipe ? '🤖 Usar Simulación' : '🎯 Usar MediaPipe Real'}
            </button>
          </div>

          {useRealMediaPipe ? (
            <PatientCameraReal 
              patientId={patientId}
              sessionId={sessionId}
              onStop={handleStop}
            />
          ) : (
            <PatientCameraSimple 
              patientId={patientId}
              sessionId={sessionId}
              onStop={handleStop}
            />
          )}
          
          <div className="mt-6 text-gray-600">
            <p>Realice gestos con las manos para que sean traducidos</p>
            <p className="text-sm">El sistema captura y envía automáticamente las secuencias de gestos</p>
            {isAutoConnected && (
              <p className="text-sm text-green-600 mt-2">
                ⚡ Su doctor puede ver las traducciones en tiempo real
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Portal del Paciente
          </h1>
          <p className="text-gray-600">
            Sistema de Traducción de Lengua de Señas
          </p>
        </div>

        {/* Aviso para conexión manual */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Conexión Manual
          </h3>
          <p className="text-sm text-yellow-700">
            Si su doctor ya creó una sesión, debería haberse abierto automáticamente. 
            Use este formulario solo si necesita conectarse manualmente.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
              ID del Paciente
            </label>
            <input
              type="text"
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: paciente001"
            />
          </div>

          <div>
            <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
              ID de Sesión
            </label>
            <input
              type="text"
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: SES-ABC123-XYZ89"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modo de Procesamiento
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  checked={useRealMediaPipe}
                  onChange={() => setUseRealMediaPipe(true)}
                  className="mr-2"
                />
                <span className="text-sm">🤖 MediaPipe Real (Recomendado)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  checked={!useRealMediaPipe}
                  onChange={() => setUseRealMediaPipe(false)}
                  className="mr-2"
                />
                <span className="text-sm">🔄 Modo Simulación</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!patientId.trim() || !sessionId.trim()}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Iniciar Captura de Gestos
          </button>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            📋 Instrucciones
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Su doctor debe crear la sesión primero</li>
            <li>• Use el ID de sesión que le proporcione el doctor</li>
            <li>• Permita el acceso a la cámara cuando se solicite</li>
            <li>• Realice gestos claros frente a la cámara</li>
          </ul>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            💡 Flujo Recomendado
          </h3>
          <ol className="text-sm text-green-700 space-y-1">
            <li>1. El doctor crea una sesión en su panel</li>
            <li>2. Se abre automáticamente esta ventana</li>
            <li>3. La conexión se establece sin configuración manual</li>
            <li>4. ¡Listo para comunicarse!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}