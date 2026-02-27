import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { genreLabels } from "@/constants/genres"; // если вынесете

const FALLBACK_COVER = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop";

const TrackCard = ({ track, onPlay, isFavorite, onToggleFavorite, isPlaying, isDark = true }) => {
  const [imgError, setImgError] = useState(false);
  const handleImageError = () => setImgError(true);
  const coverSrc = imgError || !track.cover_url ? FALLBACK_COVER : track.cover_url;

  // Классы в зависимости от темы
  const cardBg = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/50 border-gray-200';
  const hoverBg = isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-100/50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const badgeBg = isDark ? 'bg-black/60 text-white' : 'bg-white/60 text-gray-900 backdrop-blur-sm';
  const playButtonClass = cn(
    "w-14 h-14 rounded-full shadow-xl transition-colors",
    isPlaying
      ? "bg-green-500 hover:bg-green-600 text-white"
      : isDark
        ? "bg-white hover:bg-zinc-200 text-black"
        : "bg-gray-800 hover:bg-gray-700 text-white"
  );
  const favoriteButtonBg = isDark ? 'bg-black/40 hover:bg-black/60' : 'bg-white/40 hover:bg-white/60';

  return (
    <Card className={cn(
      'group relative overflow-hidden transition-all duration-300',
      cardBg,
      hoverBg
    )}>
      <div className="relative aspect-square">
        <img
          src={coverSrc}
          alt={track.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={() => onPlay(track)}
            className={playButtonClass}
          >
            <Play className="w-6 h-6 ml-0.5" />
          </Button>
        </div>

        {track.genre && (
          <span className={cn('absolute top-2 left-2 px-2 py-1 text-xs rounded-full', badgeBg)}>
            {genreLabels[track.genre] || track.genre}
          </span>
        )}

        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(track);
            }}
            className={cn(
              'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity',
              favoriteButtonBg
            )}
          >
            <Heart
              className={cn(
                'w-5 h-5',
                isFavorite ? 'fill-red-500 text-red-500' : (isDark ? 'text-white' : 'text-gray-700')
              )}
            />
          </Button>
        )}
      </div>

      <div className="p-4">
        <h3 className={cn('font-semibold truncate', textPrimary)}>{track.title}</h3>
        <p className={cn('text-sm truncate', textSecondary)}>{track.artist_name}</p>
        <div className={cn('flex items-center gap-3 mt-2 text-xs', textMuted)}>
          <span>{track.plays_count || 0} прослушиваний</span>
          <span>•</span>
          <span>{track.likes_count || 0} лайков</span>
        </div>
      </div>
    </Card>
  );
};

TrackCard.displayName = 'TrackCard';

export default TrackCard;