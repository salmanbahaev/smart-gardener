'use client';

import { Plant } from '@/types/game';

interface DeletePlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plant: Plant | null;
  isDeleting: boolean;
}

export default function DeletePlantModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  plant, 
  isDeleting 
}: DeletePlantModalProps) {
  if (!isOpen || !plant) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Удалить растение</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isDeleting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Вы уверены, что хотите удалить растение?
            </h3>
            <p className="text-gray-600">
              Растение <span className="font-semibold text-gray-800">"{plant.name}"</span> будет безвозвратно удалено из вашего сада.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-red-500 text-xl">⚠️</div>
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Внимание!</p>
                <p>Это действие нельзя отменить. Все прогресс и достижения растения будут потеряны.</p>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              disabled={isDeleting}
            >
              Отмена
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Удаление...
                </>
              ) : (
                'Удалить растение'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



