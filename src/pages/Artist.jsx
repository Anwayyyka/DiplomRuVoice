import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Heart, Music, Headphones, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import AudioPlayer from '../components/player/AudioPlayer';
import { mockUsers, mockTracks, mockFavorites } from '@/mocks/artistData';
import { useTheme } from '../contexts/ThemeContext';

export default function Artist() {
  const { isDark } = useTheme();
  const urlParams = new URLSearchParams(window.location.search);
  const artistEmail = urlParams.get('email') || 'artist@example.com';

  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [artistTracks, setArtistTracks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка моковых данных
  useEffect(() => {
    setTimeout(() => {
      const mockCurrentUser = { email: 'user@example.com', full_name: 'Текущий пользователь' };
      const mockUsersList = mockUsers;
      const artist = mockUsersList.find(u => u.email === artistEmail) || mockUsersList[0];
      const tracks = mockTracks.filter(t => t.created_by === artist.email && t.status === 'approved');
      const favs = mockFavorites.filter(f => f.user_email === mockCurrentUser.email);

      setCurrentUser(mockCurrentUser);
      setUsers(mockUsersList);
      setArtistTracks(tracks);
      setFavorites(favs);
      setLoading(false);
    }, 500);
  }, [artistEmail]);

  const artist = users.find(u => u.email === artistEmail);

  // Статистика
  const totalPlays = artistTracks.reduce((sum, t) => sum + (t.plays_count || 0), 0);
  const totalLikes = artistTracks.reduce((sum, t) => sum + (t.likes_count || 0), 0);

  const playTrack = (track) => {
    setCurrentTrack(track);
    // Увеличиваем счётчик прослушиваний локально
    setArtistTracks(prev =>
      prev.map(t => (t.id === track.id ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t))
    );
  };

  const toggleFavorite = (track) => {
    if (!currentUser) return;
    const isFav = favorites.some(f => f.track_id === track.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.track_id !== track.id));
    } else {
      setFavorites(prev => [...prev, { track_id: track.id, user_email: currentUser.email }]);
    }
  };

  const isFavorite = (track) => favorites.some(f => f.track_id === track.id);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark
    ? 'bg-zinc-800/50 backdrop-blur-sm border-zinc-700'
    : 'bg-white/80 backdrop-blur-sm border-gray-200';

  const socialLinks = [
    { key: 'telegram', icon: '📱', label: 'Telegram' },
    { key: 'vk', icon: '💬', label: 'VK' },
    { key: 'youtube', icon: '🎬', label: 'YouTube' },
    { key: 'website', icon: '🌐', label: 'Сайт' },
  ];

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        {/* Banner */}
        <div
          className="h-64 bg-cover bg-center relative"
          style={{
            backgroundImage: artist?.banner_url
              ? `url(${artist.banner_url})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Artist Info */}
        <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
          <motion.div
            className={cn('rounded-2xl p-6 border', cardBg)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-6">
              <Avatar className="w-32 h-32 ring-4 ring-purple-500/50">
                {artist?.avatar_url ? <AvatarImage src={artist.avatar_url} /> : null}
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-4xl">
                  {artist?.full_name?.[0] || artistEmail?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className={cn('text-3xl font-bold mb-2', textClass)}>
                  {artist?.full_name || artistEmail?.split('@')[0] || 'Артист'}
                </h1>
                {artist?.bio && <p className={cn('mb-4', textSecondary)}>{artist.bio}</p>}

                {/* Stats */}
                <div className="flex gap-8 mb-4">
                  <div className="text-center">
                    <p className={cn('text-2xl font-bold', textClass)}>{artistTracks.length}</p>
                    <p className={cn('text-sm', textSecondary)}>Треков</p>
                  </div>
                  <div className="text-center">
                    <p className={cn('text-2xl font-bold', textClass)}>{totalPlays}</p>
                    <p className={cn('text-sm', textSecondary)}>Прослушиваний</p>
                  </div>
                  <div className="text-center">
                    <p className={cn('text-2xl font-bold', textClass)}>{totalLikes}</p>
                    <p className={cn('text-sm', textSecondary)}>Лайков</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-2 flex-wrap">
                  {socialLinks.map(link => {
                    const url = artist?.[link.key];
                    if (!url) return null;
                    return (
                      <a
                        key={link.key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border',
                          cardBg
                        )}
                      >
                        <span>{link.icon}</span>
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tracks */}
          <motion.div
            className="mt-8 pb-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className={cn('text-2xl font-bold mb-6', textClass)}>
              Треки ({artistTracks.length})
            </h2>

            {artistTracks.length === 0 ? (
              <p className={cn('text-center py-12', textSecondary)}>Нет опубликованных треков</p>
            ) : (
              <div className="space-y-2">
                {artistTracks.map((track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    onPlay={playTrack}
                    isDark={isDark}
                    isFavorite={isFavorite(track)}
                    onToggleFavorite={() => toggleFavorite(track)}
                    isPlaying={currentTrack?.id === track.id}
                    index={index}
                    showLink
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AudioPlayer
        track={currentTrack}
        onNext={() => {}}
        onPrevious={() => {}}
        isDark={isDark}
      />
    </div>
  );
}