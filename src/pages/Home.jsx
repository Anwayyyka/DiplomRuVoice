import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import TrackCardSmall from '../components/tracks/TrackCardSmall';
import AudioPlayer from '../components/player/AudioPlayer';
import { mockUser, mockTracks, mockFavorites } from '@/mocks/homeData';
import { useTheme } from '../contexts/ThemeContext';

export default function Home() {
  const { isDark } = useTheme();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка моковых данных
  useEffect(() => {
    setTimeout(() => {
      setUser(mockUser);
      // Только одобренные треки, сортировка по дате (новые сверху)
      const approvedTracks = mockTracks
        .filter(t => t.status === 'approved')
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setTracks(approvedTracks);
      setFavorites(mockFavorites.filter(f => f.user_email === mockUser.email));
      setLoading(false);
    }, 500);
  }, []);

  const newTracks = tracks.slice(0, 5);
  const recommendedTracks = tracks.slice(0, 4);

  const playTrack = (track) => {
    setCurrentTrack(track);
    // Увеличиваем счётчик прослушиваний локально
    setTracks(prev =>
      prev.map(t => (t.id === track.id ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t))
    );
  };

  const toggleFavorite = (track) => {
    if (!user) return;
    const isFav = favorites.some(f => f.track_id === track.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.track_id !== track.id));
    } else {
      setFavorites(prev => [...prev, { track_id: track.id, user_email: user.email }]);
    }
  };

  const isFavorite = (track) => favorites.some(f => f.track_id === track.id);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="relative min-h-screen">
      {/* Весь контент */}
      <div className="relative z-10 p-8 pb-32">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={cn('text-4xl font-bold mb-2', textClass)}>Главная</h1>
          <p className={textSecondary}>Слушайте самые новые релизы</p>
        </motion.div>

        {/* New Releases - Card Grid */}
        <section className="mb-10">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {newTracks.map((track, index) => (
                <TrackCardSmall
                  key={track.id}
                  track={track}
                  onPlay={playTrack}
                  isDark={isDark}
                  isPlaying={currentTrack?.id === track.id}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recommended - List */}
        <section>
          <motion.h2
            className={cn('text-2xl font-bold mb-4', textClass)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Вам по душе
          </motion.h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recommendedTracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  onPlay={playTrack}
                  isDark={isDark}
                  isFavorite={isFavorite(track)}
                  onToggleFavorite={() => toggleFavorite(track)}
                  isPlaying={currentTrack?.id === track.id}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <AudioPlayer
        track={currentTrack}
        onNext={() => {}}
        onPrevious={() => {}}
        isFavorite={currentTrack ? isFavorite(currentTrack) : false}
        onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack)}
        isDark={isDark}
      />
    </div>
  );
}