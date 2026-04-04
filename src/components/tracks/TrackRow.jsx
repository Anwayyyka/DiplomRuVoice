import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrackRow({ track, onPlay, isDark, isFavorite, onToggleFavorite, isPlaying, index, showStats, showLink }) {
  const textClass = isDark ? 'text-white' : 'text-black';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  // Постоянный полупрозрачный фон (без наведения)
  const bgBase = isDark ? 'bg-black/40' : 'bg-white/40';
  // Фон при наведении (чуть плотнее)
  const bgHover = isDark ? 'hover:bg-black/60' : 'hover:bg-white/60';
  const playingClass = isPlaying
    ? isDark
      ? 'bg-purple-900/30 border border-purple-500/50'
      : 'bg-purple-100 border border-purple-300'
    : '';

  return (
    <motion.div
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors',
        bgBase,
        bgHover,
        playingClass
      )}
      onClick={() => onPlay(track)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4 }}
    >
      <img
        src={track.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop'}
        alt={track.title}
        className="w-12 h-12 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium truncate', textClass)}>{track.title}</p>
        <p className={cn('text-sm truncate', textSecondary)}>{track.artist_name}</p>
        {showStats && (
          <p className={cn('text-xs', textSecondary)}>{track.plays_count || 0} plays</p>
        )}
      </div>
      {onToggleFavorite && (
        <motion.button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="p-2 rounded-full hover:bg-white/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart className={cn('w-5 h-5', isFavorite ? 'fill-red-500 text-red-500' : textSecondary)} />
        </motion.button>
      )}
    </motion.div>
  );
}