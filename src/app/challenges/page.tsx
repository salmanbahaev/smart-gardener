'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  timeRemaining: number;
  userProgress: {
    isParticipating: boolean;
    isCompleted: boolean;
    overallProgress: number;
  };
}

// Временные тестовые челленджи
const TEMP_CHALLENGES: Challenge[] = [
  {
    _id: 'temp-1',
    title: 'Ежедневный полив',
    description: 'Поливайте растения каждый день в течение недели',
    difficulty: 'easy',
    timeRemaining: 7 * 24 * 60 * 60 * 1000, // 7 дней
    userProgress: {
      isParticipating: false,
      isCompleted: false,
      overallProgress: 0
    }
  },
  {
    _id: 'temp-2',
    title: 'Неделя удобрений',
    description: 'Подкармливайте растения всю неделю',
    difficulty: 'medium',
    timeRemaining: 7 * 24 * 60 * 60 * 1000, // 7 дней
    userProgress: {
      isParticipating: true,
      isCompleted: false,
      overallProgress: 60
    }
  },
  {
    _id: 'temp-3',
    title: 'Полный уход',
    description: 'Выполните все виды ухода за растениями',
    difficulty: 'hard',
    timeRemaining: 7 * 24 * 60 * 60 * 1000, // 7 дней
    userProgress: {
      isParticipating: false,
      isCompleted: false,
      overallProgress: 0
    }
  },
  {
    _id: 'temp-4',
    title: 'Мастер анализа',
    description: 'Проанализируйте 5 растений за неделю',
    difficulty: 'medium',
    timeRemaining: 7 * 24 * 60 * 60 * 1000, // 7 дней
    userProgress: {
      isParticipating: true,
      isCompleted: true,
      overallProgress: 100
    }
  }
];

function ChallengesContent() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [useTempData, setUseTempData] = useState(false);

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

    loadChallenges();
  }, [router]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch('/api/challenges', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Если API недоступен, используем временные данные
        console.log('API недоступен, используем временные данные');
        setChallenges(TEMP_CHALLENGES);
        setUseTempData(true);
        return;
      }

      const data = await response.json();
      if (data.success && data.challenges && data.challenges.length > 0) {
        setChallenges(data.challenges);
        setUseTempData(false);
      } else {
        // Если нет данных, используем временные
        console.log('Нет данных от API, используем временные данные');
        setChallenges(TEMP_CHALLENGES);
        setUseTempData(true);
      }
    } catch (err) {
      console.log('Ошибка API, используем временные данные:', err);
      // При ошибке используем временные данные
      setChallenges(TEMP_CHALLENGES);
      setUseTempData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = async (challengeId: string) => {
    if (useTempData) {
      // Для временных данных просто показываем уведомление
      setToast({
        type: 'success',
        message: 'Вы успешно присоединились к челленджу! (демо режим)'
      });
      
      // Обновляем состояние временных данных
      setChallenges(prev => prev.map(challenge => 
        challenge._id === challengeId 
          ? { ...challenge, userProgress: { ...challenge.userProgress, isParticipating: true } }
          : challenge
      ));
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch('/api/challenges/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ challengeId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setToast({
          type: 'success',
          message: 'Вы успешно присоединились к челленджу!'
        });
        loadChallenges();
      } else {
        setToast({
          type: 'error',
          message: data.error || 'Ошибка при участии в челлендже'
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Ошибка при участии в челлендже'
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      case 'expert': return 'Эксперт';
      default: return 'Неизвестно';
    }
  };

  const formatTimeRemaining = (timeRemaining: number) => {
    const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) {
      return `${days} дн. ${hours} ч.`;
    } else if (hours > 0) {
      return `${hours} ч.`;
    } else {
      return 'Менее часа';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <Loader text="Загрузка челленджей..." />
      </div>
    );
  }

  if (error && !useTempData) {
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Челленджи
          </h1>
          <p className="text-gray-600 text-lg">
            Участвуйте в испытаниях и получайте награды
          </p>
          {useTempData && (
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Демо режим - показаны тестовые челленджи</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/challenges/seed', { method: 'POST' });
                    if (response.ok) {
                      setToast({
                        type: 'success',
                        message: 'Тестовые челленджи загружены в базу данных!'
                      });
                      // Перезагружаем страницу для получения реальных данных
                      setTimeout(() => window.location.reload(), 1500);
                    } else {
                      setToast({
                        type: 'error',
                        message: 'Ошибка при загрузке челленджей'
                      });
                    }
                  } catch (err) {
                    setToast({
                      type: 'error',
                      message: 'Ошибка при загрузке челленджей'
                    });
                  }
                }}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium">Загрузить в БД</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div key={challenge._id} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800 text-lg">{challenge.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                  {getDifficultyLabel(challenge.difficulty)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{challenge.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Время осталось:</span>
                  <span className="font-medium text-gray-700">{formatTimeRemaining(challenge.timeRemaining)}</span>
                </div>
                
                {challenge.userProgress.isParticipating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Прогресс:</span>
                      <span className="font-medium text-gray-700">{challenge.userProgress.overallProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${challenge.userProgress.overallProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {challenge.userProgress.isParticipating ? (
                <div className={`text-center font-medium py-2 px-4 rounded-lg ${
                  challenge.userProgress.isCompleted 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {challenge.userProgress.isCompleted ? '✅ Завершено' : '🔄 В процессе'}
                </div>
              ) : (
                <button
                  onClick={() => handleParticipate(challenge._id)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Принять участие
                </button>
              )}
            </div>
          ))}
        </div>

        {challenges.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Челленджи пока недоступны
            </h3>
            <p className="text-gray-600">
              Загляните позже, чтобы увидеть новые испытания
            </p>
          </div>
        )}
      </div>

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

export default function ChallengesPage() {
  return (
    <ProtectedRoute>
      <ChallengesContent />
    </ProtectedRoute>
  );
} 