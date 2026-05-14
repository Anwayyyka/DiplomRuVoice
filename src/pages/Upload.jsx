import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Music } from 'lucide-react';
import UploadTrackForm from '../components/upload/UploadTrackForm';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { tracksAPI } from '@/api/tracks';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'На модерации', icon: Clock, color: 'bg-yellow-500/20 text-yellow-500' },
  approved: { label: 'Опубликован', icon: CheckCircle, color: 'bg-green-500/20 text-green-500' },
  rejected: { label: 'Отклонён', icon: XCircle, color: 'bg-red-500/20 text-red-500' }
};

export default function Upload() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [myTracks, setMyTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyTracks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const tracks = await tracksAPI.getUserTracks(user.id);
      setMyTracks(tracks);
    } catch (err) {
      console.error('Failed to load user tracks:', err);
      setError('Не удалось загрузить ваши треки');
      toast.error('Ошибка загрузки треков');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyTracks();
  }, [fetchMyTracks]);

  const handleUploadSuccess = (newTrack) => {
    setMyTracks(prev => [newTrack, ...prev]);
    toast.success('Трек успешно загружен!');
  };

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const cardBg = isDark
    ? 'bg-zinc-900/80 border-zinc-700 backdrop-blur-sm'
    : 'bg-white/80 border-gray-300 backdrop-blur-sm';

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата неизвестна';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Дата неизвестна';
    return format(date, 'd MMM yyyy', { locale: ru });
  };

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Card className={cn('max-w-md', cardBg)}>
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 mx-auto text-zinc-500 mb-4" />
            <h2 className={cn('text-xl font-semibold mb-2', textClass)}>Войдите в аккаунт</h2>
            <p className={textSecondary}>Чтобы загружать треки, необходимо авторизоваться</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className={cn('text-3xl font-bold mb-8', textClass)}>Загрузить музыку</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <UploadTrackForm onSuccess={handleUploadSuccess} isDark={isDark} />

          <Card className={cn('h-fit', cardBg)}>
            <CardHeader>
              <CardTitle className={textClass}>Мои треки</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className={textSecondary}>Загрузка...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : myTracks.length === 0 ? (
                <p className={cn('text-center py-8', textSecondary)}>Вы ещё не загружали треки</p>
              ) : (
                <div className="space-y-3">
                  {myTracks.map(track => {
                    const status = statusConfig[track.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <div
                        key={track.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg',
                          isDark ? 'bg-zinc-800/50' : 'bg-gray-100/50'
                        )}
                      >
                        <img
                          src={track.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop'}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-medium truncate', textClass)}>{track.title}</p>
                          <p className={cn('text-sm', textSecondary)}>
                            {formatDate(track.created_at || track.created_date)}
                          </p>
                          {track.status === 'rejected' && track.rejection_reason && (
                            <p className="text-sm text-red-400 mt-1">Причина: {track.rejection_reason}</p>
                          )}
                        </div>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}