import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Señas sin fronteras
          </h1>
          <h2 className="text-2xl text-gray-600 mb-6">
            Lengua de Señas en Tiempo Real
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Plataforma que permite la comunicación en tiempo real entre pacientes que usan lengua de señas 
            y profesionales médicos mediante traducción automática de gestos.
          </p>
        </div>

        {/* Cards de selección de rol */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Tarjeta del Paciente */}
          <Link href="/patient">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🤟</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Soy Paciente
                </h3>
                <p className="text-gray-600 mb-6">
                  Realiza gestos con las manos para comunicarte. 
                  El sistema capturará y traducirá tus señas en tiempo real.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    ✨ Características:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Captura de gestos con cámara web</li>
                    <li>• Traducción automática instantánea</li>
                    <li>• Visualización de keypoints en tiempo real</li>
                    <li>• Conexión directa con el doctor</li>
                  </ul>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta del Doctor */}
          <Link href="/doctor">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">👨‍⚕️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Soy Doctor
                </h3>
                <p className="text-gray-600 mb-6">
                  Recibe las traducciones de lengua de señas de tus pacientes 
                  en tiempo real durante la consulta médica.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✨ Características:
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Recepción de traducciones en tiempo real</li>
                    <li>• Historial completo de la conversación</li>
                    <li>• Interfaz clara y profesional</li>
                    <li>• Múltiples sesiones de pacientes</li>
                  </ul>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Información técnica */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔧 Información Técnica
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🕸️</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">WebSockets</h4>
              <p className="text-sm text-gray-600">
                Comunicación en tiempo real entre pacientes y doctores
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">MediaPipe</h4>
              <p className="text-sm text-gray-600">
                Detección avanzada de keypoints de manos, pose y rostro
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Next.js</h4>
              <p className="text-sm text-gray-600">
                Framework moderno para aplicaciones web escalables
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p>
            🌟 Sistema desarrollado para mejorar la comunicación médica inclusiva
          </p>
        </div>
      </div>
    </div>
  );
}