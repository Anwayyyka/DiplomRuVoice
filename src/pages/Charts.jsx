import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import TrackCardSmall from '../components/tracks/TrackCardSmall';
import AudioPlayer from '../components/player/AudioPlayer';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { tracksAPI } from '@/api/tracks';
import { favoritesAPI } from '@/api/favorites';

export default function Charts() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const approvedTracks = await tracksAPI.getApprovedTracks();
      setTracks(approvedTracks);

      if (user) {
        const favs = await favoritesAPI.getUserFavorites(user.id);
        setFavorites(favs);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Failed to load charts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topTracks = [...tracks].sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0));
  const topCards = topTracks.slice(0, 5);
  const topList = topTracks.slice(0, 10);

  const playTrack = async (track) => {
    setCurrentTrack(track);
    try {
      await tracksAPI.playTrack(track.id);
      setTracks(prev =>
        prev.map(t => t.id === track.id ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t)
      );
    } catch (error) {
      console.error('Failed to update play count:', error);
    }
  };

  const toggleFavorite = async (track) => {
    if (!user) return;
    const isFav = favorites.some(f => f.track_id === track.id);
    try {
      if (isFav) {
        await favoritesAPI.removeFavorite(user.id, track.id);
        setFavorites(prev => prev.filter(f => f.track_id !== track.id));
      } else {
        const newFav = await favoritesAPI.addFavorite(user.id, track.id);
        setFavorites(prev => [...prev, newFav]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const isFavorite = (track) => favorites.some(f => f.track_id === track.id);

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
    <div className="relative min-h-screen">
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 pb-32">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className={cn('text-4xl font-bold mb-2', textClass)}>Чарты</h1>
          <p className={textSecondary}>Топ треков по прослушиваниям</p>
        </motion.div>

        <section className="mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topCards.map((track, index) => (
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
        </section>

        <section>
          <motion.h2
            className={cn('text-2xl font-bold mb-4', textClass)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Топ 10
          </motion.h2>
          <div className="space-y-2">
            {topList.map((track, index) => (
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