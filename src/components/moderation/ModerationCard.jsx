import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Check, X, User, Calendar, Music } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const genreLabels = {
  'pop': 'Поп',
  'rock': 'Рок',
  'hip-hop': 'Хип-хоп',
  'electronic': 'Электроника',
  'jazz': 'Джаз',
  'classical': 'Классика',
  'folk': 'Фолк',
  'indie': 'Инди',
  'r&b': 'R&B',
  'metal': 'Метал',
  'other': 'Другое'
};

export default function ModerationCard({ track, onApprove, onReject, isDark = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const audioRef = useRef(null);

  // Классы для текста в зависимости от темы
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const bgCard = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/50 border-gray-200';
  const bgBadge = isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-700';
  const bgTextarea = isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900';
  const buttonRejectOutline = isDark
    ? 'border-red-600 text-red-500 hover:bg-red-600 hover:text-white'
    : 'border-red-400 text-red-600 hover:bg-red-500 hover:text-white';

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(track.id, rejectReason);
      setShowRejectForm(false);
      setRejectReason('');
    }
  };

  return (
    <Card className={cn('overflow-hidden', bgCard)}>
      <audio ref={audioRef} src={track.audio_url} onEnded={() => setIsPlaying(false)} />
      
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Cover and Play */}
          <div className="relative w-full md:w-48 aspect-square md:aspect-auto shrink-0">
            <img
              src={track.cover_url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop"}
              alt={track.title}
              className="w-full h-full object-cover"
            />
            <Button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 hover:bg-white text-black"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </Button>
          </div>

          {/* Info */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className={cn('text-lg font-semibold', textClass)}>{track.title}</h3>
                <p className={textSecondary}>{track.artist_name}</p>
              </div>
              {track.genre && (
                <Badge variant="secondary" className={bgBadge}>
                  <Music className="w-3 h-3 mr-1" />
                  {genreLabels[track.genre] || track.genre}
                </Badge>
              )}
            </div>

            {track.description && (
              <p className={cn('text-sm mb-3 line-clamp-2', textSecondary)}>{track.description}</p>
            )}

            <div className={cn('flex items-center gap-4 text-xs mb-4', textMuted)}>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {track.created_by}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(track.created_date), 'd MMM yyyy', { locale: ru })}
              </span>
            </div>

            {!showRejectForm ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => onApprove(track.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Одобрить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  className={buttonRejectOutline}
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
                  >
                    Подтвердить отклонение
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                    className={isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
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