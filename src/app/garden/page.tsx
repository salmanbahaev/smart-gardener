'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import GardenLayout from '@/components/garden/GardenLayout';
import { Garden } from '@/types/game';
import Toast from '@/components/Toast';

function GardenContent() {
  const router = useRouter();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    void loadGarden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadGarden = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch('/api/garden/load', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка загрузки сада');
      const data = await res.json();
      setGarden(data.garden);
    } catch (err: any) {
      setError(err.message ?? 'Ошибка загрузки сада');
    } finally {
      setLoading(false);
    }
  };

  const handlePlantAction = async (plantId: string, action: 'water' | 'fertilize' | 'prune') => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch('/api/garden/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plantId, actionType: action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const base = errorData.error || 'Ошибка выполнения действия';
        const extra = typeof errorData.timeRemaining === 'number' ? ` Подождите ~${errorData.timeRemaining} мин.` : '';
        throw new Error(base + extra);
      }

      await loadGarden();
      setToast({ message: 'Действие выполнено', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const { readyCount, nextReadyMinutes } = useMemo(() => {
    if (!garden?.plants) return { readyCount: 0, nextReadyMinutes: null as number | null };
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    let ready = 0;
    let minRemaining: number | null = null;
    for (const p of garden.plants) {
      const last = new Date(p.lastAction).getTime();
      const diff = now - last;
      if (diff >= oneHour) {
        ready += 1;
      } else {
        const remain = Math.ceil((oneHour - diff) / (60 * 1000));
        if (minRemaining === null || remain < minRemaining) minRemaining = remain;
      }
    }
    return { readyCount: ready, nextReadyMinutes: minRemaining };
  }, [garden]);

  const [todayRecs, setTodayRecs] = useState<{ recommendations: Array<{ title: string; reason: string }> } | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/weather/recommendations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setTodayRecs({ recommendations: data.recommendations || [] });
      } catch {}
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-green-600 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-gray-700">Загрузка сада...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ошибка загрузки</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Основной контент */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Виртуальный сад
            </h1>
            <p className="text-gray-600">Ухаживайте за своими растениями и получайте награды</p>
          </div>

          {garden && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100">
              {/* Смарт-баннер */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">🌿</div>
                  <div>
                    <div className="font-semibold text-emerald-800">Сегодня в саду</div>
                    <div className="text-emerald-700 text-sm">
                      {readyCount > 0 ? `${readyCount} раст. готовы к действию` : (typeof nextReadyMinutes === 'number' ? `Следующее действие через ~${nextReadyMinutes} мин` : 'Все на таймере')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push('/upload')} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Фото</button>
                  <button onClick={() => router.push('/journal')} className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm">Журнал</button>
                  <button onClick={() => router.push('/recommendations')} className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm">Советы</button>
                </div>
              </div>
              {/* Что сделать сегодня */}
              {todayRecs && todayRecs.recommendations?.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div className="font-semibold text-green-800 mb-2 flex items-center gap-2"><span>✅</span> Что сделать сегодня</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {todayRecs.recommendations.slice(0, 3).map((r, i) => (
                      <li key={i} className="text-sm text-green-800">
                        <span className="font-medium">{r.title}</span>
                        <span className="text-green-700"> — {r.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Статистика */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="font-semibold text-green-700">Листочки: {garden.currency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-semibold text-blue-700">Уровень: {garden.totalLevel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold text-purple-700">Растений: {garden.plants?.length || 0}</span>
                </div>
              </div>

              <GardenLayout 
                plants={garden.plants || []} 
                onPlantAction={handlePlantAction}
              />
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function GardenPage() {
  return (
    <ProtectedRoute>
      <GardenContent />
    </ProtectedRoute>
  );
} 