import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/login");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-white/90 backdrop-blur-md border-b border-green-100 text-gray-800 py-4 px-6 flex items-center justify-between shadow-lg z-50">
      {/* Логотип */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <Link href="/" className="font-bold text-xl tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hover:drop-shadow-lg transition-all duration-200 cursor-pointer">
          SmartGardener
        </Link>
      </div>

      {/* Desktop menu */}
      <div className="hidden md:flex items-center gap-6 text-base">
        <Link href="/upload" className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Загрузить фото</span>
        </Link>
        <Link href="/recommendations" className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Рекомендации</span>
        </Link>
        <Link href="/achievements" className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Достижения</span>
        </Link>
        <Link href="/challenges" className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Челленджи</span>
        </Link>
        <Link href="/garden" className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Сад</span>
        </Link>
        <Link href="/journal" className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Журнал</span>
        </Link>
        
        {/* Profile dropdown - CSS hover approach */}
        <div className="relative group">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Профиль</span>
            <div className="flex-shrink-0 ml-2">
              <svg 
                className="w-4 h-4 transition-all duration-300 group-hover:rotate-180 group-hover:text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </div>
          </button>
          
          {/* Dropdown menu */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-green-200 py-2 z-50 opacity-0 invisible scale-y-95 transform origin-top transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible group-hover:scale-y-100">
            <Link 
              href="/profile" 
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 transition-all duration-200 mx-2 rounded-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium">Мой профиль</span>
            </Link>
            <div className="mx-4 my-2 border-t border-gray-200"></div>
            <button 
              onClick={() => {
                handleLogout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 text-left mx-2 rounded-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="font-medium">Выйти</span>
            </button>
          </div>
        </div>
      </div>

      {/* Burger icon */}
      <button
        className="md:hidden flex items-center justify-center p-2 rounded-xl hover:bg-green-50 focus:outline-none transition-all duration-200"
        onClick={() => setOpen((v) => !v)}
        aria-label="Открыть меню"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile menu с анимацией */}
      <div
        className={`absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-green-100 shadow-lg flex flex-col gap-1 py-3 z-50 md:hidden transition-all duration-300 origin-top transform ${open ? 'scale-y-100 opacity-100 pointer-events-auto' : 'scale-y-95 opacity-0 pointer-events-none'}`}
        style={{ willChange: 'transform, opacity' }}
      >
        <Link 
          href="/upload" 
          className="flex items-center space-x-3 px-6 py-3 hover:bg-green-50 hover:text-green-700 transition-all duration-200" 
          onClick={() => setOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Загрузить фото</span>
        </Link>
        <Link 
          href="/recommendations" 
          className="flex items-center space-x-3 px-6 py-3 hover:bg-green-50 hover:text-green-700 transition-all duration-200" 
          onClick={() => setOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Рекомендации</span>
        </Link>
        <Link 
          href="/achievements" 
          className="flex items-center space-x-3 px-6 py-3 hover:bg-green-50 hover:text-green-700 transition-all duration-200" 
          onClick={() => setOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Достижения</span>
        </Link>
        <Link 
          href="/challenges" 
          className="flex items-center space-x-3 px-6 py-3 hover:bg-green-50 hover:text-green-700 transition-all duration-200" 
          onClick={() => setOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Челленджи</span>
        </Link>
        <Link 
          href="/garden" 
          className="flex items-center space-x-3 px-6 py-3 hover:bg-green-50 hover:text-green-700 transition-all duration-200" 
          onClick={() => setOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Сад</span>
        </Link>
        <Link 
          href="/journal" 
          className="flex items-center space-x-3 px-6 py-3 hover:bg-green-50 hover:text-green-700 transition-all duration-200" 
          onClick={() => setOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Журнал</span>
        </Link>
        <Link 
          href="/profile" 
          className="flex items-center space-x-3 px-6 py-3 hover:bg-green-50 hover:text-green-700 transition-all duration-200" 
          onClick={() => setOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Профиль</span>
        </Link>
        <button 
          onClick={() => {
            handleLogout();
            setOpen(false);
          }}
          className="flex items-center space-x-3 px-6 py-3 hover:bg-red-50 hover:text-red-700 transition-all duration-200 text-left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Выйти</span>
        </button>
      </div>
    </nav>
  );
} 