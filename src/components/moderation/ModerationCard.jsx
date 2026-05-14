import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Check, X, User, Calendar, Music } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const genreLabels = {
  pop: 'Поп',
  rock: 'Рок',
  'hip-hop': 'Хип-хоп',
  electronic: 'Электроника',
  jazz: 'Джаз',
  classical: 'Классика',
  folk: 'Фолк',
  indie: 'Инди',
  'r&b': 'R&B',
  metal: 'Метал',
  other: 'Другое',
};

function formatSafeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, 'd MMM yyyy', { locale: ru });
}

export default function ModerationCard({ track, onApprove, onReject, isDark = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const audioRef = useRef(null);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const bgCard = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/50 border-gray-200';
  const bgBadge = isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-700';
  const bgTextarea = isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900';
  const buttonRejectOutline = isDark
    ? 'border-red-600 text-red-500 hover:bg-red-600 hover:text-white'
    : 'border-red-400 text-red-600 hover:bg-red-500 hover:text-white';

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [track?.id]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback failed:', error);
      setIsPlaying(false);
    }
  };

  const handleReject = () => {
    const reason = rejectReason.trim();
    if (!reason) return;

    onReject(track.id, reason);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const createdAtLabel = formatSafeDate(track?.created_at);
  const genreKey = track?.genre || track?.genre_name;
  const genreLabel = genreKey ? genreLabels[genreKey] || genreKey : null;

  return (
    <Card className={cn('overflow-hidden', bgCard)}>
      <audio
        ref={audioRef}
        src={track?.audio_url}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      />

      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-48 aspect-square md:aspect-auto shrink-0">
            <img
              src={
                track?.cover_url ||
                'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop'
              }
              alt={track?.title || 'Track cover'}
              className="w-full h-full object-cover"
            />
            <Button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 hover:bg-white text-black"
              type="button"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </Button>
          </div>

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className={cn('text-lg font-semibold truncate', textClass)}>
                  {track?.title || 'Без названия'}
                </h3>
                <p className={cn('truncate', textSecondary)}>
                  {track?.artist_name || 'Неизвестный артист'}
                </p>
              </div>

              {genreLabel && (
                <Badge variant="secondary" className={bgBadge}>
                  <Music className="w-3 h-3 mr-1" />
                  {genreLabel}
                </Badge>
              )}
            </div>

            {track?.description && (
              <p className={cn('text-sm mb-3 line-clamp-2', textSecondary)}>
                {track.description}
              </p>
            )}

            <div className={cn('flex items-center gap-4 text-xs mb-4 flex-wrap', textMuted)}>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {track?.artist_name || 'Неизвестно'}
              </span>

              {createdAtLabel && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {createdAtLabel}
                </span>
              )}
            </div>

            {!showRejectForm ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => onApprove(track.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  type="button"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Одобрить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  className={buttonRejectOutline}
                  type="button"
                >
                  <X className="w-4 h-4 mr-2" />
                  Отклонить
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Причина отклонения..."
                  className={bgTextarea}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                    type="button"
                  >
                    Подтвердить отклонение
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                    className={isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                    type="button"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}