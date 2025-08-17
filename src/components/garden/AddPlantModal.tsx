'use client';

import { useState } from 'react';
import { Plant } from '@/types/game';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantAdded: (plant: Plant) => void;
}

const PLANT_TYPES = [
  { value: 'flower', label: 'Цветок', emoji: '🌸' },
  { value: 'herb', label: 'Травы', emoji: '🌿' },
  { value: 'succulent', label: 'Суккулент', emoji: '🌵' },
  { value: 'tree', label: 'Дерево', emoji: '🌳' },
  { value: 'vegetable', label: 'Овощ', emoji: '🥕' },
  { value: 'fruit', label: 'Фрукт', emoji: '🍎' },
  { value: 'cactus', label: 'Кактус', emoji: '🌵' },
  { value: 'orchid', label: 'Орхидея', emoji: '🌺' },
  { value: 'fern', label: 'Папоротник', emoji: '🌿' },
  { value: 'bamboo', label: 'Бамбук', emoji: '🎋' }
];

export default function AddPlantModal({ isOpen, onClose, onPlantAdded }: AddPlantModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !type) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await fetch('/api/garden/add-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim(), type })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка добавления растения');
      }

      // Создаем объект растения для передачи в callback
      const newPlant: Plant = {
        _id: data.plant._id,
        plantId: data.plant.plantId,
        virtualLevel: data.plant.virtualLevel,
        name: data.plant.name,
        type: data.plant.type,
        health: data.plant.health,
        lastWatered: data.plant.lastWatered,
        lastFertilized: data.plant.lastFertilized,
        lastPruned: data.plant.lastPruned,
        lastAction: data.plant.lastAction,
        achievements: data.plant.achievements
      };

      onPlantAdded(newPlant);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при добавлении растения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setType('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Добавить растение</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Название растения */}
          <div>
            <label htmlFor="plant-name" className="block text-sm font-medium text-gray-700 mb-2">
              Название растения
            </label>
            <input
              id="plant-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Роза, Монстера, Алоэ..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              disabled={isSubmitting}
            />
          </div>

          {/* Тип растения */}
          <div>
            <label htmlFor="plant-type" className="block text-sm font-medium text-gray-700 mb-2">
              Тип растения
            </label>
            <select
              id="plant-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              disabled={isSubmitting}
            >
              <option value="">Выберите тип растения</option>
              {PLANT_TYPES.map((plantType) => (
                <option key={plantType.value} value={plantType.value}>
                  {plantType.emoji} {plantType.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !type}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Добавление...
                </>
              ) : (
                'Добавить растение'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



