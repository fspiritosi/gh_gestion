import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#f8f9ff] overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
        <div className="absolute right-4 bottom-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
        <div className="absolute left-1/3 top-1/3 w-48 h-48 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 text-center px-8 py-12 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl max-w-lg mx-4">
        <div className="mb-8">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">¡Ups! Página no encontrada</h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, parece que la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
