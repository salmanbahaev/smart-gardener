import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="w-full bg-green-700 text-white py-3 px-4 flex items-center justify-between shadow-sm mb-6 relative">
      <div className="font-bold text-lg tracking-tight">
        <Link href="/">Умный Садовод</Link>
      </div>
      {/* Desktop menu */}
      <div className="hidden md:flex gap-4 text-base">
        <Link href="/upload" className="hover:underline">Загрузить фото</Link>
        <Link href="/recommendations" className="hover:underline">Рекомендации</Link>
        <Link href="/journal" className="hover:underline">Журнал</Link>
        <Link href="/profile" className="hover:underline">Профиль</Link>
      </div>
      {/* Burger icon */}
      <button
        className="md:hidden flex items-center justify-center p-2 rounded hover:bg-green-800 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Открыть меню"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Mobile menu с анимацией */}
      <div
        className={`absolute top-full left-0 w-full bg-green-700 shadow-lg flex flex-col gap-2 py-3 z-50 md:hidden transition-all duration-300 origin-top transform ${open ? 'scale-y-100 opacity-100 pointer-events-auto' : 'scale-y-95 opacity-0 pointer-events-none'}`}
        style={{ willChange: 'transform, opacity' }}
      >
        <Link href="/upload" className="px-6 py-2 hover:bg-green-800" onClick={() => setOpen(false)}>Загрузить фото</Link>
        <Link href="/recommendations" className="px-6 py-2 hover:bg-green-800" onClick={() => setOpen(false)}>Рекомендации</Link>
        <Link href="/journal" className="px-6 py-2 hover:bg-green-800" onClick={() => setOpen(false)}>Журнал</Link>
        <Link href="/profile" className="px-6 py-2 hover:bg-green-800" onClick={() => setOpen(false)}>Профиль</Link>
      </div>
    </nav>
  );
} 