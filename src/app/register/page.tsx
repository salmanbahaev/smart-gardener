'use client';
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1500);
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
        <h2 className="text-xl font-bold mb-4 text-green-800">Регистрация</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" className="border rounded px-3 py-2" required value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Пароль" className="border rounded px-3 py-2" required value={password} onChange={e => setPassword(e.target.value)} />
          <input type="password" placeholder="Повторите пароль" className="border rounded px-3 py-2" required value={confirm} onChange={e => setConfirm(e.target.value)} />
          <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60" disabled={loading}>{loading ? "Регистрация..." : "Зарегистрироваться"}</button>
        </form>
        {error && <div className="text-red-600 mt-3 text-sm text-center">{error}</div>}
        {success && <div className="text-green-700 mt-3 text-sm text-center">Успешно! Перенаправление...</div>}
        <p className="mt-4 text-sm text-center">
          Уже есть аккаунт? <Link href="/login" className="text-green-700 underline">Войти</Link>
        </p>
      </div>
    </main>
  );
} 