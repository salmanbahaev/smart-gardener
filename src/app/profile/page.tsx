'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import CustomSelect from "@/components/CustomSelect";

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

function ProfileContent() {
  const [profile, setProfile] = useState<{
    email: string;
    name?: string;
    phone?: string;
    telegram?: string;
    siteType?: 'garden' | 'pot';
    avatar: string;
    createdAt: string;
    analysisCount: number;
    analyses: Analysis[];
    achievements: Achievement[];
    location?: { cityName?: string; lat?: number | null; lon?: number | null; timeZone?: string } | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // State для раскрытия анализов
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [form, setForm] = useState<{ name: string; city: string; phone: string; telegram: string; siteType: 'garden' | 'pot' }>({ name: '', city: '', phone: '', telegram: '', siteType: 'garden' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === "undefined") {
      return;
    }
    
    const token = localStorage.getItem("token");
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
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || '',
          city: data.location?.cityName || '',
          phone: data.phone || '',
          telegram: data.telegram || '',
          siteType: data.siteType || 'garden',
        });
      })
      .catch(() => {
        setError("Ошибка авторизации");
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        router.push("/login");
      });
  }, [router]);

  if (error) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Основной контент */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Личный профиль
            </h1>
            <p className="text-gray-600">Управляйте своим аккаунтом и просматривайте историю</p>
          </div>

          {!profile ? (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100 text-center">
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-green-600 mr-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="text-gray-700">Загрузка профиля...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Информация о пользователе */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Аватар */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-4xl shadow-lg overflow-hidden border-4 border-white">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Информация */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile.email}</h2>
                    <div className="text-gray-700 font-medium mb-2">{form.name || 'Без имени'}</div>
                    <p className="text-gray-600 mb-4">Зарегистрирован: {new Date(profile.createdAt).toLocaleDateString('ru-RU', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    
                    {/* Статистика */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-xl">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-semibold text-green-700">Анализов: {profile.analysisCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Редактирование профиля */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <span className="text-white">✏️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Редактирование профиля</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Имя</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Как к вам обращаться"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Телефон</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+7 xxx xxx xx xx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Telegram</label>
                    <input
                      value={form.telegram}
                      onChange={(e) => setForm(f => ({ ...f, telegram: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Локация</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Город/населённый пункт"
                    />
                    <p className="text-xs text-gray-500 mt-1">В следующем шаге добавим автодополнение и координаты</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Тип выращивания</label>
                    <CustomSelect
                      value={form.siteType}
                      onChange={(value) => setForm(f => ({ ...f, siteType: (value as 'garden' | 'pot') }))}
                      options={[
                        { value: 'garden', label: 'Огород/участок' },
                        { value: 'pot', label: 'В горшке/контейнере' }
                      ]}
                      placeholder="Выберите тип выращивания"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    disabled={saving}
                    onClick={async () => {
                      try {
                        setSaving(true);
                        const token = localStorage.getItem('token');
                        const res = await fetch('/api/me', {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ name: form.name, phone: form.phone, telegram: form.telegram, siteType: form.siteType, location: { cityName: form.city } }),
                        });
                        if (res.ok) {
                          setProfile(p => p ? { ...p, name: form.name, phone: form.phone, telegram: form.telegram, siteType: form.siteType, location: { ...(p.location || {}), cityName: form.city } } : p);
                        }
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-60"
                  >
                    {saving ? 'Сохранение…' : 'Сохранить изменения'}
                  </button>
                </div>
              </div>

              {/* История анализов */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">История анализов</h3>
                </div>

                {profile.analyses.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">История анализов пуста</p>
                    <p className="text-gray-400 text-sm">Загрузите первое фото растения для анализа</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.analyses.map((a, i) => {
                      const isLong = (a.result || '').length > 180 || (a.result || '').split('\n').length > 3;
                      const collapsedText = (a.result || '').split('\n').slice(0, 3).join('\n').slice(0, 180) + (isLong ? '...' : '');
                      const expandedThis = expanded[i];
                      return (
                        <div key={i} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start gap-4">
                            {a.imageUrl && (
                              <div className="flex-shrink-0">
                                <img src={a.imageUrl} alt="Анализ растения" className="w-16 h-16 rounded-lg object-cover border-2 border-green-200 shadow-sm" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-600 mb-2">
                                {new Date(a.createdAt).toLocaleString('ru-RU', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                                {isLong && !expandedThis ? collapsedText : a.result || 'Без результата'}
                              </div>
                              {isLong && (
                                <button
                                  className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 transition-colors duration-200"
                                  onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedThis ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                  </svg>
                                  {expandedThis ? 'Свернуть' : 'Показать полностью'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Достижения */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Достижения</h3>
                </div>

                {profile.achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <p className="text-gray-500">Достижения пока не получены</p>
                    <p className="text-gray-400 text-sm">Продолжайте анализировать растения для получения достижений</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.achievements.map((ach, i) => (
                      <div key={i} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-lg">{ach.icon || '🏅'}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{ach.label}</h4>
                            <p className="text-xs text-gray-500">
                              Получено: {new Date(ach.achievedAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
} 