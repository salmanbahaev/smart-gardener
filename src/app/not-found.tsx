import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-50">
      <div className="bg-white rounded shadow p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-4 text-green-800">404</h1>
        <p className="mb-6 text-green-900 text-center">Страница не найдена.<br/>Возможно, вы ошиблись адресом или страница была удалена.</p>
        <Link href="/" className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 text-center">На главную</Link>
      </div>
    </main>
  );
} 