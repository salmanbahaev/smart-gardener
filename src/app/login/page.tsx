'use client';
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка входа");
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
        }
        router.push("/profile");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-green-800">Вход</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" className="border rounded px-3 py-2" required value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Пароль" className="border rounded px-3 py-2" required value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60" disabled={loading}>{loading ? "Вход..." : "Войти"}</button>
        </form>
        {error && <div className="text-red-600 mt-3 text-sm text-center">{error}</div>}
        <p className="mt-4 text-sm text-center">
          Нет аккаунта? <Link href="/register" className="text-green-700 underline">Зарегистрироваться</Link>
        </p>
      </div>
    </main>
  );
} 