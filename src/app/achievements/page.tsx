'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';

interface Achievement {
  _id: string;
  code: string;
  title: string;
  description: string;
  iconUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    currency: number;
    experience: number;
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

    loadAchievements();
  }, [router]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load achievements');
      }

      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
      } else {
        setError(data.error || 'Failed to load achievements');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-700';
      case 'rare':
        return 'bg-blue-100 text-blue-700';
      case 'epic':
        return 'bg-purple-100 text-purple-700';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Обычное';
      case 'rare':
        return 'Редкое';
      case 'epic':
        return 'Эпическое';
      case 'legendary':
        return 'Легендарное';
      default:
        return 'Обычное';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <Loader text="Загрузка достижений..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Ошибка загрузки</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={loadAchievements}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Декоративные круги */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-teal-200 rounded-full blur-3xl opacity-20"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
            <span className="text-2xl">🏆</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Достижения
          </h1>
          <p className="text-gray-600 text-lg">
            Отслеживайте свой прогресс и получайте награды
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{unlockedCount}</div>
              <div className="text-gray-600">Разблокировано</div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalCount}</div>
              <div className="text-gray-600">Всего</div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
              </div>
              <div className="text-gray-600">Прогресс</div>
            </div>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Общий прогресс</span>
            <span>{unlockedCount}/{totalCount}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Сетка достижений */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement._id}
              className={`bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
                achievement.isUnlocked ? 'ring-2 ring-green-500' : 'opacity-60'
              }`}
            >
              {/* Иконка и название */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-3xl">{achievement.iconUrl}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                    {getRarityLabel(achievement.rarity)}
                  </span>
                </div>
              </div>

              {/* Описание */}
              <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>

              {/* Награда */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Награда:</span>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <span className="mr-1">🍃</span>
                    {achievement.reward.currency}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">⭐</span>
                    {achievement.reward.experience}
                  </span>
                </div>
              </div>

              {/* Статус */}
              <div className="text-center">
                {achievement.isUnlocked ? (
                  <div className="text-green-600 font-medium">
                    <span className="mr-2">✅</span>
                    Разблокировано
                  </div>
                ) : (
                  <div className="text-gray-500 font-medium">
                    <span className="mr-2">🔒</span>
                    Заблокировано
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Пустое состояние */}
        {achievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Достижения не найдены
            </h3>
            <p className="text-gray-600">
              Начните ухаживать за растениями, чтобы получить достижения
            </p>
          </div>
        )}
      </div>

      {/* Toast уведомления */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 