import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Heart, Music, Headphones, Edit, Save, X, BarChart3, Settings, Star } from "lucide-react";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import TrackRow from '../components/tracks/TrackRow';
import AudioPlayer from '../components/player/AudioPlayer';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { tracksAPI } from '@/api/tracks';
import { authAPI } from '@/api/auth';
import { usersAPI } from '@/api/users';

export default function Profile() {
  const { isDark } = useTheme();
  const { user: authUser } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showBecomeArtist, setShowBecomeArtist] = useState(false);
  const [artistForm, setArtistForm] = useState({ artist_name: '', bio: '' });

  const [user, setUser] = useState(null);
  const [myTracks, setMyTracks] = useState([]);
  const [userLikes, setUserLikes] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    if (!authUser) return;
    try {
      setLoading(true);
      const userData = await authAPI.getProfile();
      setUser(userData);

      if (userData.role === 'artist') {
        const tracks = await tracksAPI.getArtistTracks(userData.id);
        setMyTracks(Array.isArray(tracks) ? tracks : []);
      } else {
        setMyTracks([]);
      }

      const approvedTracks = await tracksAPI.getApprovedTracks();
      setAllTracks(Array.isArray(approvedTracks) ? approvedTracks : []);

    } catch (error) {
      console.error('Failed to load profile data:', error);
      toast.error('Не удалось загрузить данные профиля');
      setMyTracks([]);
      setAllTracks([]);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const likedTracks = (allTracks || []).filter(t => 
    (userLikes || []).some(l => l.track_id === t.id)
  );
  const approvedTracks = (myTracks || []).filter(t => t.status === 'approved');
  const pendingTracks = (myTracks || []).filter(t => t.status === 'pending');

  const totalPlays = approvedTracks.reduce((sum, t) => sum + (t.plays_count || 0), 0);
  const totalLikes = approvedTracks.reduce((sum, t) => sum + (t.likes_count || 0), 0);

  const startEditing = () => {
    setEditForm({
      full_name: user?.full_name || '',
      bio: user?.bio || '',
      avatar_url: user?.avatar_url || '',
      banner_url: user?.banner_url || '',
      telegram: user?.telegram || '',
      vk: user?.vk || '',
      youtube: user?.youtube || '',
      website: user?.website || '',
    });
    setIsEditing(true);
  };

  const saveProfile = async () => {
    try {
      const updatedUser = await usersAPI.updateProfile(authUser.id, editForm);
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Профиль обновлён');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Ошибка при обновлении профиля');
    }
  };

  const becomeArtist = async () => {
    try {
      const updatedUser = await usersAPI.requestArtist(authUser.id, artistForm);
      setUser(updatedUser);
      setShowBecomeArtist(false);
      toast.success('Поздравляем! Теперь вы артист');
      window.location.reload(); // временно, чтобы обновить данные в Layout
    } catch (error) {
      console.error('Artist request failed:', error);
      toast.error('Ошибка при запросе статуса артиста');
    }
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
  };

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark
    ? 'bg-zinc-800/50 backdrop-blur-sm border-zinc-700'
    : 'bg-white/80 backdrop-blur-sm border-gray-200';
  const inputBg = isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900';
  const btnOutline = isDark
    ? 'border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white'
    : '';

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <p className={textSecondary}>Войдите в аккаунт</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        {/* Banner */}
        <div
          className="h-48 bg-cover bg-center relative"
          style={{
            backgroundImage: user?.banner_url
              ? `url(${user.banner_url})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-32">
          {/* Profile Header */}
          <motion.div
            className={cn('rounded-2xl p-6 mb-6 border', cardBg)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-6 flex-wrap">
              <Avatar className="w-28 h-28 ring-4 ring-purple-500/50">
                {user?.avatar_url ? <AvatarImage src={user.avatar_url} /> : null}
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl">
                  {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className={cn('text-2xl font-bold', textClass)}>
                      {user.full_name || 'Пользователь'}
                    </h1>
                    <p className={textSecondary}>{user.email}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {user.role === 'artist' && (
                      <Link to="/statistics">
                        <Button variant="outline" size="sm" className={btnOutline}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Статистика
                        </Button>
                      </Link>
                    )}
                    <Link to="/settings">
                      <Button variant="outline" size="sm" className={btnOutline}>
                        <Settings className="w-4 h-4 mr-2" />
                        Настройки
                      </Button>
                    </Link>
                    <Button onClick={startEditing} variant="outline" size="sm" className={btnOutline}>
                      <Edit className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                  </div>
                </div>

                {user?.bio && <p className={cn('mt-3', textSecondary)}>{user.bio}</p>}

                {/* Кнопка «Стать артистом» только для обычного слушателя (не артист, не админ) */}
                {user.role !== 'artist' && user.role !== 'admin' && (
                  <Button
                    asChild
                    className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Link to="/become-artist">
                      <Star className="w-4 h-4 mr-2" />
                      Стать артистом
                    </Link>
                  </Button>
                )}

                {/* Stats Cards */}
                {user.role === 'artist' && (
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <motion.div
                      className={cn('p-4 rounded-xl text-center border', cardBg)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Music className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <p className={cn('text-2xl font-bold', textClass)}>{approvedTracks.length}</p>
                      <p className={cn('text-xs', textSecondary)}>Треков</p>
                    </motion.div>
                    <motion.div
                      className={cn('p-4 rounded-xl text-center border', cardBg)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Headphones className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <p className={cn('text-2xl font-bold', textClass)}>{totalPlays}</p>
                      <p className={cn('text-xs', textSecondary)}>Прослушиваний</p>
                    </motion.div>
                    <motion.div
                      className={cn('p-4 rounded-xl text-center border', cardBg)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
                      <p className={cn('text-2xl font-bold', textClass)}>{totalLikes}</p>
                      <p className={cn('text-xs', textSecondary)}>Лайков</p>
                    </motion.div>
                    <motion.div
                      className={cn('p-4 rounded-xl text-center border', cardBg)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <p className={cn('text-2xl font-bold', textClass)}>{likedTracks.length}</p>
                      <p className={cn('text-xs', textSecondary)}>В избранном</p>
                    </motion.div>
                  </div>
                )}

                {/* Social Links */}
                {(user?.telegram || user?.vk || user?.youtube || user?.website) && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {user?.telegram && (
                      <a
                        href={user.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('px-3 py-1 rounded-full text-sm border', cardBg)}
                      >
                        📱 Telegram
                      </a>
                    )}
                    {user?.vk && (
                      <a
                        href={user.vk}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('px-3 py-1 rounded-full text-sm border', cardBg)}
                      >
                        💬 VK
                      </a>
                    )}
                    {user?.youtube && (
                      <a
                        href={user.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('px-3 py-1 rounded-full text-sm border', cardBg)}
                      >
                        🎬 YouTube
                      </a>
                    )}
                    {user?.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('px-3 py-1 rounded-full text-sm border', cardBg)}
                      >
                        🌐 Сайт
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue={user.role === 'artist' ? 'tracks' : 'liked'} className="w-full">
            <TabsList className={cn('w-full justify-start mb-6 border', cardBg)}>
              {user.role === 'artist' && (
                <>
                  <TabsTrigger value="tracks">Мои треки ({approvedTracks.length})</TabsTrigger>
                  <TabsTrigger value="pending">На модерации ({pendingTracks.length})</TabsTrigger>
                </>
              )}
              <TabsTrigger value="liked">Понравившиеся ({likedTracks.length})</TabsTrigger>
              {user.role === 'artist' && <TabsTrigger value="stats">Статистика</TabsTrigger>}
            </TabsList>

            <TabsContent value="tracks">
              {approvedTracks.length === 0 ? (
                <p className={cn('text-center py-12', textSecondary)}>Нет опубликованных треков</p>
              ) : (
                <div className="space-y-2">
                  {approvedTracks.map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      onPlay={playTrack}
                      isDark={isDark}
                      isPlaying={currentTrack?.id === track.id}
                      index={index}
                      showStats
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {pendingTracks.length === 0 ? (
                <p className={cn('text-center py-12', textSecondary)}>Нет треков на модерации</p>
              ) : (
                <div className="space-y-2">
                  {pendingTracks.map((track, index) => (
                    <TrackRow
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
            </TabsContent>

            <TabsContent value="liked">
              {likedTracks.length === 0 ? (
                <p className={cn('text-center py-12', textSecondary)}>Вы ещё не лайкали треки</p>
              ) : (
                <div className="space-y-2">
                  {likedTracks.map((track, index) => (
                    <TrackRow
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
            </TabsContent>

            <TabsContent value="stats">
              <motion.div
                className={cn('rounded-xl p-6 border', cardBg)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className={cn('text-lg font-bold mb-4', textClass)}>Статистика по трекам</h3>
                {approvedTracks.length === 0 ? (
                  <p className={textSecondary}>Загрузите треки, чтобы видеть статистику</p>
                ) : (
                  <div className="space-y-4">
                    {approvedTracks.map((track, index) => (
                      <motion.div
                        key={track.id}
                        className={cn('flex items-center gap-4 p-4 rounded-xl border', cardBg)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <img
                          src={track.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop'}
                          alt={track.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className={cn('font-medium', textClass)}>{track.title}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className={cn('font-bold', textClass)}>{track.plays_count || 0}</p>
                            <p className={cn('text-xs', textSecondary)}>прослушиваний</p>
                          </div>
                          <div className="text-center">
                            <p className={cn('font-bold', textClass)}>{track.likes_count || 0}</p>
                            <p className={cn('text-xs', textSecondary)}>лайков</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className={cn('max-w-lg border', cardBg)}>
          <DialogHeader>
            <DialogTitle className={textClass}>Редактировать профиль</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={textSecondary}>Аватар (URL)</Label>
              <Input
                value={editForm.avatar_url}
                onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className={inputBg}
              />
            </div>

            <div className="space-y-2">
              <Label className={textSecondary}>Баннер (URL)</Label>
              <Input
                value={editForm.banner_url}
                onChange={(e) => setEditForm({ ...editForm, banner_url: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                className={inputBg}
              />
            </div>

            <div className="space-y-2">
              <Label className={textSecondary}>О себе</Label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Расскажите о себе..."
                className={inputBg}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={textSecondary}>Telegram</Label>
                <Input
                  value={editForm.telegram}
                  onChange={(e) => setEditForm({ ...editForm, telegram: e.target.value })}
                  placeholder="https://t.me/..."
                  className={inputBg}
                />
              </div>
              <div className="space-y-2">
                <Label className={textSecondary}>VK</Label>
                <Input
                  value={editForm.vk}
                  onChange={(e) => setEditForm({ ...editForm, vk: e.target.value })}
                  placeholder="https://vk.com/..."
                  className={inputBg}
                />
              </div>
              <div className="space-y-2">
                <Label className={textSecondary}>YouTube</Label>
                <Input
                  value={editForm.youtube}
                  onChange={(e) => setEditForm({ ...editForm, youtube: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className={inputBg}
                />
              </div>
              <div className="space-y-2">
                <Label className={textSecondary}>Сайт</Label>
                <Input
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="https://..."
                  className={inputBg}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Отмена
            </Button>
            <Button onClick={saveProfile} className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Become Artist Dialog */}
      <Dialog open={showBecomeArtist} onOpenChange={setShowBecomeArtist}>
        <DialogContent className={cn('max-w-lg border', cardBg)}>
          <DialogHeader>
            <DialogTitle className={textClass}>Стать артистом</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={textSecondary}>Имя артиста</Label>
              <Input
                value={artistForm.artist_name}
                onChange={(e) => setArtistForm({ ...artistForm, artist_name: e.target.value })}
                placeholder="Под каким именем вы будете публиковать треки?"
                className={inputBg}
              />
            </div>
            <div className="space-y-2">
              <Label className={textSecondary}>О себе</Label>
              <Textarea
                value={artistForm.bio}
                onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })}
                placeholder="Расскажите о своем творчестве..."
                className={inputBg}
              />
            </div>
            <div className={cn('p-4 rounded-lg', isDark ? 'bg-purple-900/20' : 'bg-purple-100')}>
              <p className={cn('text-sm', textSecondary)}>
                После становления артистом вы сможете загружать треки, просматривать статистику и зарабатывать на прослушиваниях.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBecomeArtist(false)}>
              <X className="w-4 h-4 mr-2" />
              Отмена
            </Button>
            <Button
              onClick={becomeArtist}
              disabled={!artistForm.artist_name.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Star className="w-4 h-4 mr-2" />
              Стать артистом
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AudioPlayer
        track={currentTrack}
        onNext={() => {}}
        onPrevious={() => {}}
        isDark={isDark}
      />
    </div>
  );
}