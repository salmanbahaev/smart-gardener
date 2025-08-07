'use client';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Возвращаем заглушку для серверного рендеринга
    return (
      <nav className="fixed top-0 left-0 right-0 w-full bg-white/90 backdrop-blur-md border-b border-green-100 text-gray-800 py-4 px-6 flex items-center justify-between shadow-lg z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            SmartGardener
          </span>
        </div>
        <div className="hidden md:block">
          <div className="w-6 h-6"></div>
        </div>
      </nav>
    );
  }

  return <Navbar />;
} 