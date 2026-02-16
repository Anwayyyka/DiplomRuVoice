import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Heart, Music, Headphones, Edit, Upload, Image, Save, X, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import TrackRow from '../components/tracks/TrackRow';
import AudioPlayer from '../components/player/AudioPlayer';
import { mockUser, mockAllTracks, mockUserLikes, mockMyTracks } from '@/mocks/profileData';
import { useTheme } from '../contexts/ThemeContext';

export default function Profile() {
   const { isDark } = useTheme();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [user, setUser] = useState(null);
  const [myTracks, setMyTracks] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
  const [userLikes, setUserLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка моковых данных
  useEffect(() => {
    setTimeout(() => {
      setUser(mockUser);
      setMyTracks(mockMyTracks);
      setAllTracks(mockAllTracks.filter(t => t.status === 'approved'));
      setUserLikes(mockUserLikes);
      setLoading(false);
    }, 500);
  }, []);

  const likedTracks = allTracks.filter(t => userLikes.some(l => l.track_id === t.id));
  const approvedTracks = myTracks.filter(t => t.status === 'approved');
  const pendingTracks = myTracks.filter(t => t.status === 'pending');
  const rejectedTracks = myTracks.filter(t => t.status === 'rejected');

  const totalPlays = approvedTracks.reduce((sum, t) => sum + (t.plays_count || 0), 0);
  const totalLikes = approvedTracks.reduce((sum, t) => sum + (t.likes_count || 0), 0);

  const startEditing = () => {
    setEditForm({
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

  const saveProfile = () => {
    setUser(prev => ({ ...prev, ...editForm }));
    setIsEditing(false);
    toast.success('Профиль обновлён');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEditForm({ ...editForm, avatar_url: url });
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEditForm({ ...editForm, banner_url: url });
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
  const inputBg = isDark
    ? 'bg-zinc-900 border-zinc-700 text-white'
    : 'bg-white border-gray-200 text-gray-900';

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
            <div className="flex items-start gap-6">
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
                  <Button onClick={startEditing} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                </div>

                {user?.bio && <p className={cn('mt-3', textSecondary)}>{user.bio}</p>}

                {/* Stats Cards */}
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
          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className={cn('w-full justify-start mb-6 border', cardBg)}>
              <TabsTrigger value="tracks">Мои треки ({approvedTracks.length})</TabsTrigger>
              <TabsTrigger value="pending">На модерации ({pendingTracks.length})</TabsTrigger>
              <TabsTrigger value="liked">Понравившиеся ({likedTracks.length})</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
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
              <Label className={textSecondary}>Аватар</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {editForm.avatar_url ? <AvatarImage src={editForm.avatar_url} /> : null}
                  <AvatarFallback>{user.full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Загрузить
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className={textSecondary}>Баннер</Label>
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                <div
                  className={cn(
                    'h-24 rounded-lg bg-cover bg-center flex items-center justify-center border-2 border-dashed',
                    isDark ? 'border-zinc-700' : 'border-gray-300'
                  )}
                  style={editForm.banner_url ? { backgroundImage: `url(${editForm.banner_url})` } : {}}
                >
                  {!editForm.banner_url && <Image className="w-8 h-8 text-zinc-500" />}
                </div>
              </label>
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

      <AudioPlayer
        track={currentTrack}
        onNext={() => {}}
        onPrevious={() => {}}
        isDark={isDark}
      />
    </div>
  );
}