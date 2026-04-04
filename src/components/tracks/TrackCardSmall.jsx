import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';

const TrackCardSmall = ({ track, onPlay, isDark, isPlaying }) => {
  const [imgError, setImgError] = useState(false);
  const coverSrc = imgError || !track.cover_url ? FALLBACK_COVER : track.cover_url;

  const bgClass = isDark ? 'bg-zinc-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-500';
  const buttonClass = isDark ? 'bg-white text-black' : 'bg-gray-900 text-white';

  return (
    <motion.div
      className={cn(
        'group rounded-xl overflow-hidden cursor-pointer',
        bgClass,
        isPlaying && 'ring-2 ring-purple-500'
      )}
      onClick={() => onPlay(track)}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-square overflow-hidden">
        <motion.img
          src={coverSrc}
          alt={track.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={cn('w-14 h-14 rounded-full flex items-center justify-center shadow-xl', buttonClass)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </motion.div>
        </motion.div>

        {isPlaying && (
          <div className="absolute bottom-2 left-2 flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-purple-500 rounded-full"
                animate={{ height: [8, 16, 8] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3">
        <Link
          to={`/track/${track.id}`}
          onClick={(e) => e.stopPropagation()}
          className={cn('font-medium truncate text-sm hover:underline block', textClass)}
        >
          {track.title}
        </Link>
        <Link
          to={`/artist/${encodeURIComponent(track.created_by)}`}
          onClick={(e) => e.stopPropagation()}
          className={cn('text-xs truncate hover:underline block', textSecondary)}
        >
          {track.artist_name}
        </Link>
      </div>
    </motion.div>
  );
};

TrackCardSmall.displayName = 'TrackCardSmall';

export default TrackCardSmall;