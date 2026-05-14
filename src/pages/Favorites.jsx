import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import AudioPlayer from '../components/player/AudioPlayer';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { tracksAPI } from '@/api/tracks';
import { advanceInPlaylist, isSameTrack } from '@/lib/playback';

export default function Favorites() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playbackToggle, setPlaybackToggle] = useState(0);
  const [playerUiPlaying, setPlayerUiPlaying] = useState(false);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavoriteTracks = async () => {
      if (!user || favorites.length === 0) {
        setFavoriteTracks([]);
        setLoading(false);
        return;
      }
      try {
        const trackIds = new Set(favorites.map(f => Number(f.track_id)));
        const allTracks = await tracksAPI.getApprovedTracks({ limit: 200 });
        const filtered = allTracks.filter(track => trackIds.has(Number(track.id)));
        setFavoriteTracks(filtered);
      } catch (error) {
        console.error('Failed to load favorite tracks:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFavoriteTracks();
  }, [user, favorites]);

  const playTrack = async (track) => {
    if (currentTrack && isSameTrack(currentTrack, track)) {
      setPlaybackToggle((n) => n + 1);
      return;
    }
    setPlaybackToggle(0);
    setCurrentTrack(track);
    try {
      await tracksAPI.playTrack(track.id);
      setFavoriteTracks(prev =>
        prev.map(t => (isSameTrack(t, track) ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t))
      );
    } catch (error) {
      console.error('Failed to update play count:', error);
    }
  };

  const goNext = () => {
    const next = advanceInPlaylist(favoriteTracks, currentTrack, 1);
    if (next) playTrack(next);
  };

  const goPrevious = () => {
    const prev = advanceInPlaylist(favoriteTracks, currentTrack, -1);
    if (prev) playTrack(prev);
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
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-8 pb-32">
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
              onToggleFavorite={() => removeFavorite(track.id)}
              isPlaying={isSameTrack(currentTrack, track) && playerUiPlaying}
              index={index}
            />
          ))}
        </div>
      )}

      <AudioPlayer
        track={currentTrack}
        playbackToggle={playbackToggle}
        onPlayingChange={setPlayerUiPlaying}
        onNext={goNext}
        onPrevious={goPrevious}
        isFavorite={true}
        onToggleFavorite={() => currentTrack && removeFavorite(currentTrack.id)}
        isDark={isDark}
      />
    </div>
  );
}