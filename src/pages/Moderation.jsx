import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Inbox } from 'lucide-react';
import ModerationCard from '../components/moderation/ModerationCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { mockAdminUser, mockPendingTracks } from '@/mocks/moderationData';
import { useTheme } from '../contexts/ThemeContext';

export default function Moderation() {
   const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [pendingTracks, setPendingTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUser(mockAdminUser);
      setPendingTracks(mockPendingTracks);
      setLoading(false);
    }, 500);
  }, []);

  const handleApprove = (trackId) => {
    setPendingTracks(prev => prev.filter(track => track.id !== trackId));
    toast.success('Трек одобрен и опубликован!');
  };

  const handleReject = (trackId, reason) => {
    setPendingTracks(prev => prev.filter(track => track.id !== trackId));
    toast.success('Трек отклонён');
  };

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark
    ? 'bg-zinc-900/80 border-zinc-700 backdrop-blur-sm'
    : 'bg-white/80 border-gray-300 backdrop-blur-sm';

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Card className={cn('max-w-md', cardBg)}>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-zinc-500 mb-4" />
            <h2 className={cn('text-xl font-semibold mb-2', textClass)}>Загрузка...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Card className={cn('max-w-md', cardBg)}>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-zinc-500 mb-4" />
            <h2 className={cn('text-xl font-semibold mb-2', textClass)}>Доступ запрещён</h2>
            <p className={textSecondary}>Эта страница доступна только модераторам</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={cn('text-3xl font-bold flex items-center gap-3', textClass)}>
              <Shield className="w-8 h-8" />
              Модерация
            </h1>
            <p className={cn('mt-1', textSecondary)}>Проверка загруженных треков</p>
          </div>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 text-lg px-4 py-2">
            {pendingTracks.length} на проверке
          </Badge>
        </div>

        {loading ? (
          <p className={textSecondary}>Загрузка...</p>
        ) : pendingTracks.length === 0 ? (
          <Card className={cn(cardBg)}>
            <CardContent className="p-12 text-center">
              <Inbox className="w-16 h-16 mx-auto text-zinc-500 mb-4" />
              <h2 className={cn('text-xl font-semibold mb-2', textClass)}>Очередь пуста</h2>
              <p className={textSecondary}>Все треки проверены, новых заявок нет</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingTracks.map(track => (
              <ModerationCard
                key={track.id}
                track={track}
                onApprove={handleApprove}
                onReject={handleReject}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}