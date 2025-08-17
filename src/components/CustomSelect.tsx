'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Выберите опцию',
  className = '',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && optionsRef.current) {
      const selectedElement = optionsRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;
    }
  };

  const handleOptionClick = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleOptionMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  return (
    <div 
      ref={selectRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Основное поле выбора */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-white/80 backdrop-blur-sm border border-gray-300 
          rounded-xl text-left transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
          hover:border-green-400 hover:bg-white/90
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
          ${isOpen ? 'border-green-500 bg-white shadow-lg' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="select-label"
      >
        <span className={`${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {/* Анимированная стрелка */}
        <div className="flex-shrink-0 ml-3">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-green-500' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Выпадающий список */}
      {isOpen && (
        <div
          ref={optionsRef}
          className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-green-200 
                     rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 
                     duration-200 ease-out"
          role="listbox"
          aria-labelledby="select-label"
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => handleOptionMouseEnter(index)}
              className={`
                px-4 py-3 cursor-pointer transition-all duration-150
                ${option.value === value 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm' 
                  : 'text-gray-700 hover:bg-green-50'
                }
                ${highlightedIndex === index && option.value !== value 
                  ? 'bg-green-100' 
                  : ''
                }
              `}
              role="option"
              aria-selected={option.value === value}
              data-selected={option.value === value}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                {option.value === value && (
                  <svg
                    className="w-4 h-4 text-white ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





