'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Analysis {
  imageUrl: string;
  result: string;
  createdAt: string;
}
interface Achievement {
  code: string;
  label: string;
  icon: string;
  achievedAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    email: string;
    avatar: string;
    createdAt: string;
    analysisCount: number;
    analyses: Analysis[];
    achievements: Achievement[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // State для раскрытия анализов
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

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
      .then((data) => setProfile(data))
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
      <div className="w-full max-w-[1140px] bg-white/30 backdrop-blur-md border border-green-300/60 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 flex flex-col items-center my-8 animate-fade-in mx-auto px-4">
        <h2 className="text-xl font-bold mb-4 text-green-800">Профиль</h2>
        {!profile ? (
          <div>Загрузка...</div>
        ) : (
          <>
            {/* Аватар и email */}
            <div className="flex flex-col items-center mb-4 w-full">
              <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center text-4xl mb-2 overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span role="img" aria-label="avatar">🌱</span>
                )}
              </div>
              <div className="text-green-900 font-mono text-base break-all">{profile.email}</div>
              <div className="text-xs text-zinc-500 mt-1">Зарегистрирован: {new Date(profile.createdAt).toLocaleDateString()}</div>
            </div>
            {/* Статистика */}
            <div className="w-full mb-4 flex flex-col items-center">
              <div className="text-green-800 font-semibold text-lg">Анализов: {profile.analysisCount}</div>
            </div>
            {/* История анализов */}
            <div className="w-full mb-4">
              <div className="font-semibold text-green-700 mb-2">Последние анализы:</div>
              {profile.analyses.length === 0 ? (
                <div className="text-zinc-400 text-sm">Нет истории анализов</div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {profile.analyses.map((a, i) => {
                    const isLong = (a.result || '').length > 180 || (a.result || '').split('\n').length > 3;
                    const collapsedText = (a.result || '').split('\n').slice(0, 3).join('\n').slice(0, 180) + (isLong ? '...' : '');
                    const expandedThis = expanded[i];
                    return (
                      <li key={i} className="bg-green-50 rounded p-2 text-green-900 text-sm flex items-center gap-2 border border-green-100">
                        {a.imageUrl && <img src={a.imageUrl} alt="img" className="w-8 h-8 rounded object-cover border border-green-200" />}
                        <div className="flex-1">
                          <div className="font-mono break-words whitespace-pre-line">
                            {isLong && !expandedThis ? collapsedText : a.result || 'Без результата'}
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">{new Date(a.createdAt).toLocaleString()}</div>
                          {isLong && (
                            <button
                              className="text-green-700 underline text-xs mt-1 hover:text-green-900 transition"
                              onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                            >
                              {expandedThis ? 'Свернуть' : 'Показать полностью'}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {/* Ачивки */}
            <div className="w-full mb-4">
              <div className="font-semibold text-green-700 mb-2">Достижения:</div>
              {profile.achievements.length === 0 ? (
                <div className="text-zinc-400 text-sm">Нет достижений</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.achievements.map((ach, i) => (
                    <div key={i} className="flex items-center gap-1 bg-green-100 rounded px-2 py-1 text-green-800 text-xs">
                      <span>{ach.icon || '🏅'}</span>
                      <span>{ach.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full mt-2">Выйти</button>
          </>
        )}
      </div>
    </main>
  );
} 