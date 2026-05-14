import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Heart, Music, Headphones, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import TrackRow from '../components/tracks/TrackRow';
import AudioPlayer from '../components/player/AudioPlayer';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { usersAPI } from '@/api/users';
import { tracksAPI } from '@/api/tracks';
import { advanceInPlaylist, isSameTrack } from '@/lib/playback';

export default function Artist() {
  const { isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const { isFavorite, addFavorite, removeFavorite, reloadFavorites } = useFavorites();
  const [searchParams] = useSearchParams();
  const artistEmail = searchParams.get('email') || '';

  const [artist, setArtist] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playbackToggle, setPlaybackToggle] = useState(0);
  const [playerUiPlaying, setPlayerUiPlaying] = useState(false);

  const fetchArtistData = useCallback(async () => {
    if (!artistEmail) return;
    setLoading(true);
    try {
      const artistData = await usersAPI.getUserByEmail(artistEmail);
      setArtist(artistData);
      const tracks = await tracksAPI.getArtistTracks(artistData.id);
      setArtistTracks(tracks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [artistEmail]);

  useEffect(() => {
    reloadFavorites();
    fetchArtistData();
  }, [fetchArtistData, reloadFavorites]);

  const totalPlays = artistTracks.reduce((sum, t) => sum + (t.plays_count || 0), 0);
  const totalLikes = artistTracks.reduce((sum, t) => sum + (t.likes_count || 0), 0);

  const playTrack = async (track) => {
    if (currentTrack && isSameTrack(currentTrack, track)) {
      setPlaybackToggle((n) => n + 1);
      return;
    }
    setPlaybackToggle(0);
    setCurrentTrack(track);
    try {
      await tracksAPI.playTrack(track.id);
      setArtistTracks(prev =>
        prev.map(t => (isSameTrack(t, track) ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t))
      );
    } catch (error) {
      console.error('Failed to update play count:', error);
    }
  };

  const goNext = () => {
    const next = advanceInPlaylist(artistTracks, currentTrack, 1);
    if (next) playTrack(next);
  };

  const goPrevious = () => {
    const prev = advanceInPlaylist(artistTracks, currentTrack, -1);
    if (prev) playTrack(prev);
  };

  const toggleFavorite = (track) => {
    if (!currentUser) return;
    if (isFavorite(track.id)) {
      removeFavorite(track.id);
    } else {
      addFavorite(track.id);
    }
  };

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-zinc-800/50 backdrop-blur-sm border-zinc-700' : 'bg-white/80 backdrop-blur-sm border-gray-200';

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

  if (error || !artist) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <p className={textSecondary}>Артист не найден</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-10">
          <motion.div
            className={cn('rounded-2xl p-6 border', cardBg)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
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
                        className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border', cardBg)}
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

          <motion.div className="mt-8 pb-32" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className={cn('text-2xl font-bold mb-6', textClass)}>Треки ({artistTracks.length})</h2>
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
                    isFavorite={isFavorite(track.id)}
                    onToggleFavorite={() => toggleFavorite(track)}
                    isPlaying={isSameTrack(currentTrack, track) && playerUiPlaying}
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
        playbackToggle={playbackToggle}
        onPlayingChange={setPlayerUiPlaying}
        onNext={goNext}
        onPrevious={goPrevious}
        isFavorite={currentTrack ? isFavorite(currentTrack.id) : false}
        onToggleFavorite={currentTrack && currentUser ? () => toggleFavorite(currentTrack) : undefined}
        isDark={isDark}
      />
    </div>
  );
}