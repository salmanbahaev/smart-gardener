"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

type Analysis = {
  imageUrl?: string;
  result?: string;
  createdAt?: string;
};

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<Analysis | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Требуется авторизация");
      setLoading(false);
      return;
    }
    void loadMe(token);
  }, []);

  async function loadMe(token: string) {
    try {
      const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки профиля");
      const analyses: Analysis[] = Array.isArray(data.analyses) ? data.analyses : [];
      setLast(analyses[0] || null);
    } catch (e: any) {
      setError(e.message || "Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  }

  const short = useMemo(() => {
    if (!last?.result) return "";
    return last.result.split(/\r?\n/).slice(0, 12).join("\n");
  }, [last]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Основной контент */}
        <div className="relative z-10 flex min-h-screen flex-col items-center p-6">
          <div className="w-full max-w-2xl">
            {/* Заголовок */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
                <span className="text-2xl text-white">🌿</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Рекомендации по уходу
              </h1>
              <p className="text-gray-600">Итоги последнего анализа по фото</p>
            </div>

            {/* Основной контент */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100">
              {loading && <div className="py-16 text-center text-gray-600">Загрузка рекомендаций…</div>}
              {!loading && error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
              )}
              {!loading && !error && !last && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">📷</div>
                  <div className="text-gray-700 font-semibold mb-2">Нет данных анализа</div>
                  <p className="text-gray-600 mb-4">Сделайте фото растения, чтобы получить рекомендации</p>
                  <Link href="/upload" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Загрузить фото</Link>
                </div>
              )}

              {!loading && !error && last && (
                <div className="space-y-4">
                  {last.imageUrl && (
                    <img src={last.imageUrl} alt="Растение" className="w-full rounded-xl border" />
                  )}
                  <div className="text-gray-800 whitespace-pre-line text-sm">{short}</div>
                  <div className="flex gap-2">
                    <Link href="/upload" className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Новый анализ</Link>
                    <Link href="/journal" className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm">Открыть журнал</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 