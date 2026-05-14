import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import TrackCardSmall from '../components/tracks/TrackCardSmall';
import AudioPlayer from '../components/player/AudioPlayer';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { tracksAPI } from '@/api/tracks';
import { advanceInPlaylist, isSameTrack } from '@/lib/playback';

export default function Charts() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playbackToggle, setPlaybackToggle] = useState(0);
  const [playerUiPlaying, setPlayerUiPlaying] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const approvedTracks = await tracksAPI.getApprovedTracks();
        setTracks(approvedTracks);
      } catch (error) {
        console.error('Failed to load charts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  const topTracks = [...tracks].sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0));
  const topCards = topTracks.slice(0, 5);
  const topList = topTracks.slice(0, 10);

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
    const next = advanceInPlaylist(topTracks, currentTrack, 1);
    if (next) playTrack(next);
  };

  const goPrevious = () => {
    const prev = advanceInPlaylist(topTracks, currentTrack, -1);
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
                isPlaying={isSameTrack(currentTrack, track) && playerUiPlaying}
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