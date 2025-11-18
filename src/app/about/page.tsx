import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero principal */}
  <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 bg-gray-50 border-b">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            La plataforma inclusiva para la comunicación médica
          </h1>
          <ul className="mb-8 space-y-3 text-lg text-gray-700">
            <li>• Derribamos barreras entre personas sordas y profesionales de la salud</li>
            <li>• Traducción de lengua de señas en tiempo real</li>
            <li>• Compromiso con la equidad y la accesibilidad</li>
          </ul>
          <Link href="/doctor" className="inline-block">
            <span className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors text-base shadow-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              Comenzar
            </span>
          </Link>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image src="/logo-final-2.svg" alt="Logo Señas Sin Fronteras" width={260} height={260} className="drop-shadow-xl" />
        </div>
      </section>

      {/* Cards de valores y visión */}
      <section className="max-w-6xl mx-auto px-6 md:px-0 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">¿Quiénes somos?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card: Compromiso */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border-t-4 border-blue-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Compromiso</h3>
            <p className="text-gray-700 text-center">
              Creemos que la comunicación es un derecho fundamental. Trabajamos para que todas las personas, sin importar sus capacidades auditivas, participen activamente en su atención médica.
            </p>
          </div>
          {/* Card: Visión */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border-t-4 border-purple-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Visión</h3>
            <p className="text-gray-700 text-center">
              Ser la plataforma líder en inclusión comunicativa en el sector salud, inspirando a otras organizaciones a adoptar prácticas más accesibles y humanas.
            </p>
          </div>
          {/* Card: Valores */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border-t-4 border-pink-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Valores</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 text-left">
              <li><b>Inclusión:</b> Participación plena de las personas sordas en el ámbito médico.</li>
              <li><b>Accesibilidad:</b> Soluciones tecnológicas fáciles de usar y disponibles para todos.</li>
              <li><b>Empatía:</b> Personas en el centro, escuchando y respondiendo a sus necesidades.</li>
              <li><b>Innovación:</b> Tecnología como herramienta para el cambio social positivo.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sección visual tipo "creado por" */}
      <section className="w-full bg-purple-50 py-16 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-6 md:px-0">
          <div className="md:w-1/2 flex justify-center mb-8 md:mb-0">
            {/* Puedes cambiar esta imagen por una ilustración de inclusión o comunicación */}
            <Image src="/logo-final2.jpg" alt="Ilustración inclusiva" width={220} height={220} className="rounded-full bg-white shadow" />
          </div>
          <div className="md:w-1/2 md:pl-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Creado por y para la inclusión</h3>
            <p className="text-lg text-gray-700 mb-2">
              Señas Sin Fronteras nace de la colaboración entre expertos en tecnología, salud y comunidad sorda. Nuestra misión es transformar la experiencia médica en un espacio accesible, humano y empático.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="w-full flex flex-col items-center py-16">
        <h4 className="text-2xl font-semibold text-gray-800 mb-4 text-center">¿Quieres saber más o comenzar a usar la plataforma?</h4>
        <div className="flex gap-4">
          <Link href="/" className="inline-block">
            <span className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded transition-colors text-base shadow-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              Volver al inicio
            </span>
          </Link>
          <Link href="/doctor" className="inline-block">
            <span className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded transition-colors text-base shadow-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
              Ir a la plataforma
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
