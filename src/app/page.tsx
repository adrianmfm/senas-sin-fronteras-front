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

        {/* Interfaz solo para el doctor */}
        <div className="max-w-2xl mx-auto mt-12 bg-white rounded-lg shadow-lg p-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido, Doctor</h2>
            <p className="text-lg text-gray-700 mb-6">
              Inicie la consulta y gestione la comunicación con el paciente. Cuando esté listo, podrá habilitar la pestaña del paciente para que este comience a grabar sus señas y participar en la consulta.
            </p>
            <Link href="/doctor">
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition-colors text-lg">
                Ir a la interfaz del doctor
              </button>
            </Link>
          </div>
        </div>

        {/* Inclusión */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Compromiso con la Inclusión
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-2">Accesibilidad Universal</h4>
              <p className="text-sm text-gray-600">
                Nuestra plataforma está diseñada para que todas las personas, sin importar sus capacidades auditivas, puedan comunicarse de manera efectiva en el ámbito médico.
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-2">Equidad en la Salud</h4>
              <p className="text-sm text-gray-600">
                Promovemos la igualdad de oportunidades en la atención médica, eliminando barreras de comunicación y facilitando el acceso a servicios de calidad.
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-2">Empoderamiento</h4>
              <p className="text-sm text-gray-600">
                Fomentamos la autonomía de las personas sordas, permitiéndoles expresar sus necesidades y participar activamente en su atención médica.
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