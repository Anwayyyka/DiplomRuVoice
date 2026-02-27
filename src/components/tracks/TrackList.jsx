import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { genreLabels } from "@/constants/genres";

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop';

const TrackListItem = ({ track, index, isCurrentTrack, isFavorite, onPlay, onToggleFavorite, formatDuration, isDark }) => {
  const [imgError, setImgError] = useState(false);
  const coverSrc = imgError || !track.cover_url ? FALLBACK_COVER : track.cover_url;

  // Классы в зависимости от темы
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const bgHover = isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-100/50';
  const currentTrackBg = isDark ? 'bg-zinc-800/70' : 'bg-gray-200/70';
  const genreBadgeClass = isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600';
  const heartColor = isFavorite ? 'fill-red-500 text-red-500' : (isDark ? 'text-zinc-400' : 'text-gray-400');
  const playButtonClass = isDark ? 'text-white' : 'text-gray-900';

  return (
    <div
      className={cn(
        'group flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer',
        bgHover,
        isCurrentTrack && currentTrackBg
      )}
      onClick={() => onPlay(track)}
    >
      <span className={cn('w-6 text-center text-sm group-hover:hidden', textSecondary)}>
        {index + 1}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn('w-6 h-6 hidden group-hover:flex', playButtonClass)}
        onClick={(e) => {
          e.stopPropagation();
          onPlay(track);
        }}
      >
        <Play className="w-4 h-4" />
      </Button>

      <img
        src={coverSrc}
        alt={track.title}
        className="w-10 h-10 rounded object-cover"
        onError={() => setImgError(true)}
      />

      <div className="flex-1 min-w-0">
        <p className={cn('font-medium truncate', isCurrentTrack ? 'text-green-500' : textClass)}>
          {track.title}
        </p>
        <p className={cn('text-sm truncate', textSecondary)}>{track.artist_name}</p>
      </div>

      {track.genre && (
        <span className={cn('hidden md:block px-2 py-1 text-xs rounded-full', genreBadgeClass)}>
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
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className={cn('w-4 h-4', heartColor)} />
        </Button>
      )}

      <span className={cn('text-sm w-12 text-right', textSecondary)}>
        {formatDuration(track.duration)}
      </span>
    </div>
  );
};

const TrackList = ({ tracks, onPlay, currentTrack, favorites, onToggleFavorite, isDark = true }) => {
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isTrackFavorite = (trackId) => favorites?.some(f => f.track_id === trackId);

  return (
    <div className="space-y-1">
      {tracks.map((track, index) => (
        <TrackListItem
          key={track.id}
          track={track}
          index={index}
          isCurrentTrack={currentTrack?.id === track.id}
          isFavorite={isTrackFavorite(track.id)}
          onPlay={onPlay}
          onToggleFavorite={onToggleFavorite}
          formatDuration={formatDuration}
          isDark={isDark}
        />
      ))}
    </div>
  );
};

TrackList.displayName = 'TrackList';

export default TrackList;