import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const UserNotRegisteredError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-zinc-900/90 border-zinc-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-500/10">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Доступ ограничен</h1>
            <p className="text-zinc-400 mb-6">
              Вы не зарегистрированы для использования этого приложения. Пожалуйста, свяжитесь с администратором для получения доступа.
            </p>
            <div className="p-4 bg-zinc-800/50 rounded-lg text-sm text-zinc-400 text-left">
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