import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { genreLabels } from "@/constants/genres"; // если вынесете

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop';

const TrackList = ({ tracks, onPlay, currentTrack, favorites, onToggleFavorite }) => {
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isTrackFavorite = (trackId) => favorites?.some(f => f.track_id === trackId);

  return (
    <div className="space-y-1">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isFavorite = isTrackFavorite(track.id);
        const [imgError, setImgError] = useState(false); // состояние для каждого трека
        const coverSrc = imgError || !track.cover_url ? FALLBACK_COVER : track.cover_url;

        return (
          <div
            key={track.id}
            className={cn(
              'group flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer',
              isCurrentTrack && 'bg-zinc-800/70'
            )}
            onClick={() => onPlay(track)}
          >
            <span className="w-6 text-center text-sm text-zinc-500 group-hover:hidden">
              {index + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 hidden group-hover:flex text-white"
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
              <p className={cn('font-medium truncate', isCurrentTrack ? 'text-green-500' : 'text-white')}>
                {track.title}
              </p>
              <p className="text-sm text-zinc-400 truncate">{track.artist_name}</p>
            </div>

            {track.genre && (
              <span className="hidden md:block px-2 py-1 text-xs bg-zinc-800 text-zinc-400 rounded-full">
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
                <Heart
                  className={cn('w-4 h-4', isFavorite ? 'fill-red-500 text-red-500' : 'text-zinc-400')}
                />
              </Button>
            )}

            <span className="text-sm text-zinc-500 w-12 text-right">
              {formatDuration(track.duration)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

TrackList.displayName = 'TrackList';

export default TrackList;