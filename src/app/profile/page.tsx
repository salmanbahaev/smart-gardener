'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Ошибка авторизации");
        }
        return res.json();
      })
      .then((data) => setEmail(data.email))
      .catch(() => {
        setError("Ошибка авторизации");
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (error) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-sm flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-green-800">Профиль</h2>
        {email ? (
          <>
            <div className="mb-4 text-green-900">Email: <span className="font-mono">{email}</span></div>
            <button onClick={handleLogout} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Выйти</button>
          </>
        ) : (
          <div>Загрузка...</div>
        )}
      </div>
    </main>
  );
} 