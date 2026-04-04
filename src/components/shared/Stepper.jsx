import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/**
 * Горизонтальный степпер для многошаговых форм.
 * Подсвечивает текущий шаг и отображает завершённые (галочка).
 *
 * @param {Object} props
 * @param {number} props.currentStep - Текущий шаг (0-based)
 * @param {Array<{ label: string }>} props.steps - Массив шагов с подписями
 * @param {boolean} [props.isDark] - Тёмная тема
 */
export default function Stepper({ currentStep, steps, isDark = true }) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const lineBg = isDark ? 'bg-zinc-700' : 'bg-gray-300';
  const lineDone = 'bg-purple-500';
  const circleCurrent = 'border-purple-500 bg-purple-500/20 text-purple-400';
  const circleDone = 'border-purple-500 bg-purple-500 text-white';
  const circlePending = isDark ? 'border-zinc-600 bg-zinc-800 text-zinc-500' : 'border-gray-300 bg-gray-100 text-gray-500';

  return (
    <nav className="w-full" aria-label="Прогресс формы">
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={index}
              className={cn('flex flex-1 items-center', !isLast && 'pr-2 sm:pr-4')}
            >
              <div className="flex flex-col items-center flex-1">
                {/* Кружок с номером или галочкой */}
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted && circleDone,
                    isCurrent && circleCurrent,
                    !isCompleted && !isCurrent && circlePending
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1.5 text-xs font-medium text-center max-w-[80px] sm:max-w-none',
                    isCurrent ? textClass : textMuted
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Линия между шагами */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 sm:mx-2 rounded transition-colors',
                    isCompleted ? lineDone : lineBg
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
