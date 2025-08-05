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

function ChallengesContent() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
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
      const token = localStorage.getItem("token");
      const response = await fetch('/api/challenges', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load challenges');
      }

      const data = await response.json();
      if (data.success) {
        setChallenges(data.challenges);
      } else {
        setError(data.error || 'Failed to load challenges');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = async (challengeId: string) => {
    try {
      const token = localStorage.getItem("token");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <Loader text="Загрузка челленджей..." />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div key={challenge._id} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-2">{challenge.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
              
              {challenge.userProgress.isParticipating ? (
                <div className="text-green-600 font-medium">
                  {challenge.userProgress.isCompleted ? '✅ Завершено' : '🔄 В процессе'}
                </div>
              ) : (
                <button
                  onClick={() => handleParticipate(challenge._id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Принять участие
                </button>
              )}
            </div>
          ))}
        </div>
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