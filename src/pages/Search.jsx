import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import AudioPlayer from '../components/player/AudioPlayer';
import { mockUser, mockTracks, mockFavorites } from '@/mocks/homeData';
import { useTheme } from '../contexts/ThemeContext';

export default function Search() {
   const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUser(mockUser);
      setTracks(mockTracks.filter(t => t.status === 'approved'));
      setFavorites(mockFavorites.filter(f => f.user_email === mockUser.email));
      setLoading(false);
    }, 500);
  }, []);

  const filteredTracks = tracks.filter(
    track =>
      track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const playTrack = (track) => {
    setCurrentTrack(track);
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

  const inputBg = isDark
    ? 'bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 backdrop-blur-sm'
    : 'bg-white/80 border-gray-300 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm';

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
        className="relative max-w-2xl mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <SearchIcon
          className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5',
            isDark ? 'text-zinc-500' : 'text-gray-400'
          )}
        />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Название трека или исполнителя..."
          className={cn('pl-12 py-6 rounded-xl text-lg', inputBg)}
        />
      </motion.div>

      <div className="space-y-2">
        {filteredTracks.map((track, index) => (
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
        {filteredTracks.length === 0 && searchQuery && (
          <motion.p
            className={cn('text-center py-12', textSecondary)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Ничего не найдено
          </motion.p>
        )}
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