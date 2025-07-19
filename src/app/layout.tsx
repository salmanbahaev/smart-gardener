'use client';
import { Inter, Fira_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const firaMono = Fira_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-fira-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="min-h-full">
      <body
        className={`${inter.variable} ${firaMono.variable} antialiased bg-gradient-to-br from-slate-50 to-zinc-100 min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}
