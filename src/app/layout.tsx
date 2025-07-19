'use client';
import { Inter, Fira_Mono } from 'next/font/google';
import './globals.css';
import Navbar from "@/components/Navbar";

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
      <head>
        <title>SmartGardener — помощник садовода</title>
        <meta name="description" content="SmartGardener — распознавание растений, рекомендации по уходу, персональный журнал. Ваш умный помощник-садовод!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${firaMono.variable} antialiased bg-gradient-to-br from-slate-50 to-zinc-100 min-h-full`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
