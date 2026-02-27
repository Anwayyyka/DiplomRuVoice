import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import AudioPlayer from '../components/player/AudioPlayer';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { tracksAPI } from '@/api/tracks';
import { favoritesAPI } from '@/api/favorites';

export default function Favorites() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setFavoriteTracks([]);
      return;
    }
    try {
      setLoading(true);
      // Ожидаем, что API возвращает массив полных объектов треков
      const tracks = await favoritesAPI.getUserFavorites(user.id);
      setFavoriteTracks(tracks);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const playTrack = async (track) => {
    setCurrentTrack(track);
    try {
      await tracksAPI.playTrack(track.id);
      setFavoriteTracks(prev =>
        prev.map(t => t.id === track.id ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t)
      );
    } catch (error) {
      console.error('Failed to update play count:', error);
    }
  };

  const removeFromFavorites = async (track) => {
    if (!user) return;
    try {
      await favoritesAPI.removeFavorite(user.id, track.id);
      setFavoriteTracks(prev => prev.filter(t => t.id !== track.id));
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
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