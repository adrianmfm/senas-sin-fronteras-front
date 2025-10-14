'use client';

import React, { useState } from 'react';
import DoctorInterface from '@/components/DoctorInterface';

export default function DoctorPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handleConnect = () => {
    if (doctorId.trim() && sessionId.trim()) {
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

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
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Portal del Doctor
          </h1>
          <p className="text-gray-600">
            Sistema de Traducción de Lengua de Señas
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-2">
              ID del Doctor
            </label>
            <input
              type="text"
              id="doctorId"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: doctor001"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: sesion001"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={!doctorId.trim() || !sessionId.trim()}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Conectar a Sesión
          </button>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            📋 Instrucciones
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Ingrese su ID de doctor único</li>
            <li>• Use el mismo ID de sesión que su paciente</li>
            <li>• Las traducciones aparecerán automáticamente</li>
            <li>• Puede ver el historial completo de la sesión</li>
          </ul>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            💡 Consejos
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Coordine con el paciente el ID de sesión</li>
            <li>• Mantenga la conexión estable durante la consulta</li>
            <li>• Use el historial para revisar conversaciones anteriores</li>
          </ul>
        </div>
      </div>
    </div>
  );
}