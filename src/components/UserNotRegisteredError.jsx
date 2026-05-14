import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const UserNotRegisteredError = ({ isDark = true }) => {
  const bgGradient = isDark
    ? 'from-zinc-900 to-zinc-800'
    : 'from-gray-100 to-gray-200';
  const cardBg = isDark
    ? 'bg-zinc-900/90 border-zinc-800'
    : 'bg-white/90 border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const adviceBg = isDark ? 'bg-zinc-800/50' : 'bg-gray-200/50';

  return (
    <div className={cn('min-h-screen bg-gradient-to-b flex items-center justify-center p-4', bgGradient)}>
      <Card className={cn('max-w-md w-full', cardBg)}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-500/10">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className={cn('text-2xl font-bold mb-2', textClass)}>Доступ ограничен</h1>
            <p className={cn('mb-6', textSecondary)}>
              Вы не зарегистрированы для использования этого приложения. Пожалуйста, свяжитесь с администратором для получения доступа.
            </p>
            <div className={cn('p-4 rounded-lg text-sm text-left', adviceBg, textSecondary)}>
              <p className="mb-2">Если вы считаете, что это ошибка:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Убедитесь, что вы вошли с правильным аккаунтом</li>
                <li>Свяжитесь с администратором приложения</li>
                <li>Попробуйте выйти и войти снова</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

UserNotRegisteredError.displayName = 'UserNotRegisteredError';

export default UserNotRegisteredError;