'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export const Header = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    window.location.href = '/login';
  };

  // No mostrar header en página de login
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <span className="text-white font-bold text-sm">🤟</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Señas Sin Fronteras
              </span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link 
              href="/patient" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🤟 Paciente
            </Link>
            <Link 
              href="/doctor" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🩺 Doctor
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* User Actions */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                
                {/* User Info */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {user?.displayName || 'Usuario'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={loading || isLoggingOut}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? (
                    <span className="text-sm">Cerrando...</span>
                  ) : (
                    <span className="text-sm hidden lg:block">Cerrar sesión</span>
                  )}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              
              {/* Navigation Links */}
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Inicio
              </Link>
              <Link 
                href="/patient" 
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🤟 Paciente
              </Link>
              <Link 
                href="/doctor" 
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🩺 Doctor
              </Link>

              {/* User Actions - Mobile */}
              {isAuthenticated ? (
                <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                  
                  {/* User Info - Mobile */}
                  <div className="px-3 py-2 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {user?.displayName || 'Usuario'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logout Button - Mobile */}
                  <button
                    onClick={handleLogout}
                    disabled={loading || isLoggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Iniciar sesión
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
