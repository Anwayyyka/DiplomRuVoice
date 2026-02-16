import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { genreLabels } from "@/constants/genres"; // если вынесете

// fallback изображение
const FALLBACK_COVER = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop";

const TrackCard = ({ track, onPlay, isFavorite, onToggleFavorite, isPlaying }) => {
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => setImgError(true);
  const coverSrc = imgError || !track.cover_url ? FALLBACK_COVER : track.cover_url;

  const playButtonClass = cn(
    "w-14 h-14 rounded-full shadow-xl transition-colors",
    isPlaying
      ? "bg-green-500 hover:bg-green-600 text-white"
      : "bg-white hover:bg-zinc-200 text-black"
  );

  return (
    <Card className="group relative overflow-hidden bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-all duration-300">
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
          <span className="absolute top-2 left-2 px-2 py-1 text-xs bg-black/60 text-white rounded-full">
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
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 hover:bg-black/60"
          >
            <Heart
              className={cn(
                "w-5 h-5",
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              )}
            />
          </Button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{track.title}</h3>
        <p className="text-sm text-zinc-400 truncate">{track.artist_name}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
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