'use client';

import { useState, useEffect } from 'react';
import ActionButton from './ActionButton';
import { Plant } from '@/types/game';

interface PlantCardProps {
  plant: Plant;
  onAction: (plantId: string, actionType: 'water' | 'fertilize' | 'prune') => void;
  onDelete?: (plant: Plant) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function PlantCard({ plant, onAction, onDelete, isSelected, onSelect }: PlantCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Обновляем каждую минуту

    return () => clearInterval(interval);
  }, []);

  const handleAction = async (actionType: 'water' | 'fertilize' | 'prune') => {
    setIsLoading(true);
    try {
      await onAction(plant.plantId.toString(), actionType);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlantIcon = (type: string) => {
    switch (type) {
      case 'orchid':
        return '🌸';
      case 'cactus':
        return '🌵';
      default:
        return '🌱';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-500';
    if (health >= 60) return 'text-yellow-500';
    if (health >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'text-purple-500';
    if (level >= 60) return 'text-blue-500';
    if (level >= 40) return 'text-green-500';
    if (level >= 20) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const formatLastAction = (date: Date | string) => {
    if (!currentTime) return 'Загрузка...';
    
    const diff = currentTime.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Только что';
    if (hours < 24) return `${hours}ч назад`;
    const days = Math.floor(hours / 24);
    return `${days}д назад`;
  };

  return (
    <div 
      className={`bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer ${
        isSelected ? 'ring-2 ring-green-500' : ''
      }`}
      onClick={onSelect}
    >
      {/* Заголовок растения */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{getPlantIcon(plant.type)}</div>
          <div>
            <h3 className="font-semibold text-gray-800">{plant.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{plant.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-lg font-bold ${getLevelColor(plant.virtualLevel)}`}>
              Ур. {plant.virtualLevel}
            </div>
            <div className={`text-sm ${getHealthColor(plant.health)}`}>
              {plant.health}% здоровья
            </div>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(plant);
              }}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Удалить растение"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Прогресс-бар уровня */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Уровень</span>
          <span>{plant.virtualLevel}/100</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500`}
            style={{ width: `${Math.min(plant.virtualLevel, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Прогресс-бар здоровья */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Здоровье</span>
          <span>{plant.health}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              plant.health >= 80 ? 'bg-green-500' :
              plant.health >= 60 ? 'bg-yellow-500' :
              plant.health >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${plant.health}%` }}
          ></div>
        </div>
      </div>

      {/* Последние действия */}
      <div className="mb-4 text-xs text-gray-500 space-y-1">
        <div>💧 Полив: {formatLastAction(plant.lastWatered)}</div>
        <div>🌱 Подкормка: {formatLastAction(plant.lastFertilized)}</div>
        <div>✂️ Обрезка: {formatLastAction(plant.lastPruned)}</div>
      </div>

      {/* Достижения */}
      {plant.achievements.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Достижения:</div>
          <div className="flex flex-wrap gap-1">
            {plant.achievements.slice(0, 3).map((achievement, index) => (
              <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                🏆
              </span>
            ))}
            {plant.achievements.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{plant.achievements.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="grid grid-cols-3 gap-2">
        <ActionButton
          type="water"
          onClick={() => handleAction('water')}
          disabled={isLoading}
          loading={isLoading}
        />
        <ActionButton
          type="fertilize"
          onClick={() => handleAction('fertilize')}
          disabled={isLoading}
          loading={isLoading}
        />
        <ActionButton
          type="prune"
          onClick={() => handleAction('prune')}
          disabled={isLoading}
          loading={isLoading}
        />
      </div>
    </div>
  );
} 