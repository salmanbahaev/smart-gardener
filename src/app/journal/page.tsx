"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

type Analysis = {
  imageUrl?: string;
  result?: string;
  createdAt?: string;
};

export default function JournalPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

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
      setAnalyses(Array.isArray(data.analyses) ? data.analyses : []);
    } catch (e: any) {
      setError(e.message || "Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  }

  const formatted = useMemo(() => {
    return analyses.map((a) => ({
      ...a,
      dateLabel: a.createdAt ? new Date(a.createdAt).toLocaleString() : "",
      shortText: (a.result || "").split(/\r?\n/).slice(0, 6).join("\n"),
    }));
  }, [analyses]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center p-6">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <span className="text-2xl text-white">📔</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Журнал растений</h1>
                  <p className="text-gray-600 text-sm">Последние анализы и заметки</p>
                </div>
              </div>
              <Link href="/upload" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Добавить фото</Link>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-green-100">
              {loading && (
                <div className="py-16 text-center text-gray-600">Загрузка журнала…</div>
              )}
              {!loading && error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
              )}
              {!loading && !error && formatted.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">📷</div>
                  <div className="text-gray-700 font-semibold mb-2">Пока нет записей</div>
                  <p className="text-gray-600 mb-4">Сделайте первый анализ растения по фото</p>
                  <Link href="/upload" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Загрузить фото</Link>
                </div>
              )}

              {!loading && !error && formatted.length > 0 && (
                <div className="space-y-4">
                  {formatted.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white/70">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="Фото" className="w-24 h-24 rounded-lg object-cover border" />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">нет фото</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm text-gray-500">{item.dateLabel}</div>
                          <Link href="/recommendations" className="text-emerald-700 text-sm hover:underline">Открыть</Link>
                        </div>
                        <div className="text-gray-800 whitespace-pre-line text-sm line-clamp-6">{item.shortText}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}