import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import TrackCardSmall from '../components/tracks/TrackCardSmall';
import AudioPlayer from '../components/player/AudioPlayer';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { tracksAPI } from '@/api/tracks';
import { advanceInPlaylist, isSameTrack } from '@/lib/playback';

export default function Home() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playbackToggle, setPlaybackToggle] = useState(0);
  const [playerUiPlaying, setPlayerUiPlaying] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTracks = async () => {
      setLoading(true);
      try {
        const approvedTracks = await tracksAPI.getApprovedTracks() || [];
        setTracks(approvedTracks);
      } catch (error) {
        console.error('Failed to load tracks:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTracks();
  }, []);

  const newTracks = tracks?.slice(0, 5) || [];
  const recommendedTracks = tracks?.slice(0, 4) || [];

  const playTrack = async (track) => {
    if (currentTrack && isSameTrack(currentTrack, track)) {
      setPlaybackToggle((n) => n + 1);
      return;
    }
    setPlaybackToggle(0);
    setCurrentTrack(track);
    try {
      await tracksAPI.playTrack(track.id);
      setTracks(prev =>
        prev.map(t => (isSameTrack(t, track) ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t))
      );
    } catch (error) {
      console.error('Failed to update play count:', error);
    }
  };

  const toggleFavorite = (track) => {
    if (!user) return;
    if (isFavorite(track.id)) {
      removeFavorite(track.id);
    } else {
      addFavorite(track.id);
    }
  };

  const goNext = () => {
    const next = advanceInPlaylist(tracks, currentTrack, 1);
    if (next) playTrack(next);
  };

  const goPrevious = () => {
    const prev = advanceInPlaylist(tracks, currentTrack, -1);
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
    <div className="relative min-h-screen">
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 pb-32">
        <motion.div className="mb-6 sm:mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className={cn('text-2xl sm:text-3xl lg:text-4xl font-bold mb-2', textClass)}>Главная</h1>
          <p className={textSecondary}>Слушайте самые новые релизы</p>
        </motion.div>

        <section className="mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {newTracks.map((track, index) => (
              <TrackCardSmall
                key={track.id}
                track={track}
                onPlay={playTrack}
                isDark={isDark}
                isPlaying={isSameTrack(currentTrack, track) && playerUiPlaying}
                index={index}
              />
            ))}
          </div>
        </section>

        <section>
          <motion.h2 className={cn('text-2xl font-bold mb-4', textClass)} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            Вам по душе
          </motion.h2>
          <div className="space-y-2">
            {recommendedTracks.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                onPlay={playTrack}
                isDark={isDark}
                isFavorite={isFavorite(track.id)}
                onToggleFavorite={() => toggleFavorite(track)}
                isPlaying={isSameTrack(currentTrack, track) && playerUiPlaying}
                index={index}
              />
            ))}
          </div>
        </section>
      </div>
      <AudioPlayer
        track={currentTrack}
        playbackToggle={playbackToggle}
        onPlayingChange={setPlayerUiPlaying}
        onNext={goNext}
        onPrevious={goPrevious}
        isFavorite={currentTrack ? isFavorite(currentTrack.id) : false}
        onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack)}
        isDark={isDark}
      />
    </div>
  );
}