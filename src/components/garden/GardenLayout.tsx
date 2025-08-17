'use client';

import { useState } from 'react';
import PlantCard from './PlantCard';
import { Plant } from '@/types/game';

interface GardenLayoutProps {
  plants: Plant[];
  onPlantAction: (plantId: string, actionType: 'water' | 'fertilize' | 'prune') => void;
  onPlantDelete?: (plant: Plant) => void;
  onAddPlant?: () => void;
}

export default function GardenLayout({ plants, onPlantAction, onPlantDelete, onAddPlant }: GardenLayoutProps) {
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Ваши растения
        </h2>
        <p className="text-gray-600 mb-4">
          Ухаживайте за растениями, чтобы они росли и развивались
        </p>
        {onAddPlant && (
          <button
            onClick={onAddPlant}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Добавить растение
          </button>
        )}
      </div>

      {/* Сетка растений */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map((plant) => (
          <PlantCard
            key={plant._id?.toString() || plant.plantId.toString()}
            plant={plant}
            onAction={onPlantAction}
            onDelete={onPlantDelete}
            isSelected={selectedPlant === (plant._id?.toString() || plant.plantId.toString())}
            onSelect={() => setSelectedPlant(plant._id?.toString() || plant.plantId.toString())}
          />
        ))}
      </div>

      {/* Пустое состояние */}
      {plants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            У вас пока нет растений
          </h3>
          <p className="text-gray-600">
            Начните с загрузки фото растения для анализа
          </p>
        </div>
      )}

      {/* Подсказки */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          💡 Советы по уходу
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-blue-500">💧</span>
            <span>Поливайте растения регулярно</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">🌱</span>
            <span>Подкармливайте для роста</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-orange-500">✂️</span>
            <span>Обрезайте для здоровья</span>
          </div>
        </div>
      </div>
    </div>
  );
} 