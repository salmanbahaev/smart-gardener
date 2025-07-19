import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-50">
      {/* Проверочный блок Tailwind удалён */}
      <h1 className="text-3xl font-bold mb-4 text-green-800">SmartGardener</h1>
      <p className="mb-6 text-center max-w-xl text-green-900">
        Добро пожаловать в помощник умного садовода! Распознавайте растения по фото, получайте рекомендации по уходу и ведите персональный журнал.
      </p>
      <nav className="flex flex-col gap-3 w-full max-w-xs">
        <Link href="/register" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-center">Регистрация</Link>
        <Link href="/login" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center">Вход</Link>
        <Link href="/upload" className="bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500 text-center">Загрузить фото</Link>
        <Link href="/recommendations" className="bg-green-300 text-green-900 py-2 px-4 rounded hover:bg-green-400 text-center">Рекомендации</Link>
        <Link href="/journal" className="bg-green-200 text-green-900 py-2 px-4 rounded hover:bg-green-300 text-center">Журнал</Link>
      </nav>
    </main>
  );
}
