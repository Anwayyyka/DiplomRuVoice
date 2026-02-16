import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import AudioPlayer from '../components/player/AudioPlayer';
import { mockUser, mockTracks, mockFavorites } from '@/mocks/favoritesData';
import { useTheme } from '../contexts/ThemeContext';

export default function Favorites() {
   const { isDark } = useTheme();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [user, setUser] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUser(mockUser);
      setAllTracks(mockTracks.filter(t => t.status === 'approved'));
      setFavorites(mockFavorites);
      setLoading(false);
    }, 500);
  }, []);

  const favoriteTracks = allTracks.filter(track =>
    favorites.some(f => f.track_id === track.id)
  );

  const playTrack = (track) => {
    setCurrentTrack(track);
    setAllTracks(prev =>
      prev.map(t => (t.id === track.id ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t))
    );
  };

  const removeFromFavorites = (track) => {
    setFavorites(prev => prev.filter(f => f.track_id !== track.id));
  };

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-8 pb-32">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={cn('text-4xl font-bold mb-2 flex items-center gap-3', textClass)}>
          <Heart className="w-8 h-8 text-red-500" />
          Избранное
        </h1>
      </motion.div>

      {!user ? (
        <motion.div
          className={cn('text-center py-12', textSecondary)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Войдите, чтобы видеть избранное</p>
        </motion.div>
      ) : favoriteTracks.length === 0 ? (
        <motion.div
          className={cn('text-center py-12', textSecondary)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Пока пусто</p>
          <p className="text-sm mt-2">Добавляйте треки в избранное, нажимая на сердечко</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {favoriteTracks.map((track, index) => (
            <TrackRow
              key={track.id}
              track={track}
              onPlay={playTrack}
              isDark={isDark}
              isFavorite={true}
              onToggleFavorite={() => removeFromFavorites(track)}
              isPlaying={currentTrack?.id === track.id}
              index={index}
            />
          ))}
        </div>
      )}

      <AudioPlayer
        track={currentTrack}
        onNext={() => {}}
        onPrevious={() => {}}
        isFavorite={true}
        onToggleFavorite={() => currentTrack && removeFromFavorites(currentTrack)}
        isDark={isDark}
      />
    </div>
  );
}