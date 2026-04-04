import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

// Заглушка: текущая заявка пользователя (можно заменить на контекст/API)
const MOCK_MY_APPLICATION = {
  id: 'my1',
  status: 'pending', // 'draft' | 'pending' | 'approved' | 'rejected'
  submittedAt: '2025-02-28T10:00:00Z',
  moderatorComment: null,
  currentStep: 1,
};

export default function MyRequests({ isDark: isDarkProp }) {
  const { isDark: isDarkContext } = useTheme();
  const isDark = isDarkProp ?? isDarkContext ?? true;

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-zinc-900/80 border-zinc-700' : 'bg-white/80 border-gray-200';

  useEffect(() => {
    setTimeout(() => {
      setApplication(MOCK_MY_APPLICATION);
      setLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const statusConfig = {
    draft: { label: 'Черновик', icon: FileText, className: 'bg-zinc-500/20 text-zinc-400' },
    pending: { label: 'На модерации', icon: Clock, className: 'bg-yellow-500/20 text-yellow-500' },
    approved: { label: 'Одобрено', icon: CheckCircle, className: 'bg-green-500/20 text-green-500' },
    rejected: { label: 'Отклонено', icon: XCircle, className: 'bg-red-500/20 text-red-500' },
  };

  if (loading) {
    return (
      <div className="relative min-h-screen p-4 py-8">
        <div className="max-w-xl mx-auto">
          <Skeleton className={cn('h-8 w-48 mb-6', isDark ? 'bg-zinc-800' : 'bg-gray-200')} />
          <Card className={cardBg}>
            <CardContent className="p-6 space-y-4">
              <Skeleton className={cn('h-6 w-full', isDark ? 'bg-zinc-800' : 'bg-gray-200')} />
              <Skeleton className={cn('h-4 w-3/4', isDark ? 'bg-zinc-800' : 'bg-gray-200')} />
              <Skeleton className={cn('h-10 w-32', isDark ? 'bg-zinc-800' : 'bg-gray-200')} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasApplication = application && application.status !== undefined;
  const status = hasApplication ? statusConfig[application.status] || statusConfig.pending : null;
  const StatusIcon = status?.icon ?? Clock;

  return (
    <div className="relative min-h-screen p-4 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className={cn('text-2xl sm:text-3xl font-bold mb-6', textClass)}>
          Мои заявки
        </h1>
        <p className={cn('text-sm mb-6', textSecondary)}>
          Статус заявки на получение статуса артиста
        </p>

        {!hasApplication ? (
          <Card className={cardBg}>
            <CardContent className="p-8 text-center">
              <FileText className={cn('w-12 h-12 mx-auto mb-3', textSecondary)} />
              <p className={cn('font-medium mb-2', textClass)}>У вас пока нет заявок</p>
              <p className={cn('text-sm mb-4', textSecondary)}>
                Подайте заявку на статус артиста, чтобы загружать треки и управлять контентом.
              </p>
              <Button asChild>
                <Link to="/become-artist">Подать заявку</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className={cardBg}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={cn('flex items-center gap-2', textClass)}>
                  <User className="w-5 h-5" />
                  Заявка на статус артиста
                </CardTitle>
                <Badge className={cn('shrink-0', status.className)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={cn('text-sm', textSecondary)}>
                Дата подачи: {formatDate(application.submittedAt)}
              </p>
              {application.moderatorComment && (
                <div className={cn('p-3 rounded-lg', isDark ? 'bg-zinc-800' : 'bg-gray-100')}>
                  <p className={cn('text-xs font-medium mb-1', textSecondary)}>Комментарий модератора</p>
                  <p className={cn('text-sm', textClass)}>{application.moderatorComment}</p>
                </div>
              )}

              {application.status === 'draft' && (
                <Button asChild>
                  <Link to="/become-artist">Продолжить заполнение</Link>
                </Button>
              )}
              {application.status === 'approved' && (
                <Button asChild>
                  <Link to="/profile">Перейти в профиль артиста</Link>
                </Button>
              )}
              {application.status === 'rejected' && (
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link to="/become-artist">Подать заявку снова</Link>
                  </Button>
                </div>
              )}
              {application.status === 'pending' && (
                <p className={cn('text-sm', textSecondary)}>
                  Заявка на проверке. Мы свяжемся с вами после модерации.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
