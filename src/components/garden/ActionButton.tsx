'use client';

interface ActionButtonProps {
  type: 'water' | 'fertilize' | 'prune';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ActionButton({ type, onClick, disabled, loading }: ActionButtonProps) {
  const getActionConfig = (type: string) => {
    switch (type) {
      case 'water':
        return {
          icon: '💧',
          label: 'Полить',
          color: 'bg-blue-500 hover:bg-blue-600',
          disabledColor: 'bg-blue-300'
        };
      case 'fertilize':
        return {
          icon: '🌱',
          label: 'Подкормить',
          color: 'bg-green-500 hover:bg-green-600',
          disabledColor: 'bg-green-300'
        };
      case 'prune':
        return {
          icon: '✂️',
          label: 'Обрезать',
          color: 'bg-orange-500 hover:bg-orange-600',
          disabledColor: 'bg-orange-300'
        };
      default:
        return {
          icon: '❓',
          label: 'Действие',
          color: 'bg-gray-500 hover:bg-gray-600',
          disabledColor: 'bg-gray-300'
        };
    }
  };

  const config = getActionConfig(type);

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex flex-col items-center justify-center p-3 rounded-xl text-white font-medium
        transition-all duration-200 transform hover:scale-105 active:scale-95
        ${disabled || loading ? config.disabledColor : config.color}
        ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      `}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <span className="text-lg mb-1">{config.icon}</span>
      )}
      <span className="text-xs">{config.label}</span>
    </button>
  );
} 