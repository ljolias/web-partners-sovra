'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chrome } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    oauth_failed: 'Error al iniciar sesion con Google',
    oauth_denied: 'Acceso denegado por el usuario',
    invalid_callback: 'Callback invalido',
    invalid_state: 'Estado de sesion invalido',
    unauthorized_domain: 'Solo usuarios con email @sovra.io pueden acceder',
    callback_failed: 'Error al procesar la autenticacion',
  };

  return (
    <>
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            {errorMessages[error] || 'Error desconocido'}
          </p>
        </div>
      )}

      {/* Google Sign In Button */}
      <a
        href="/api/auth/google"
        className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        <Chrome className="w-5 h-5" />
        <span>Continuar con Google</span>
      </a>
    </>
  );
}

export default function SovraLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sovra Admin</h1>
            <p className="text-gray-500 mt-2">Panel de administracion interno</p>
          </div>

          <Suspense fallback={
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          }>
            <LoginContent />
          </Suspense>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              Solo usuarios con email <strong>@sovra.io</strong> pueden acceder
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <a
              href="/es/partners/login"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Eres partner? Ir al Portal de Partners
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
