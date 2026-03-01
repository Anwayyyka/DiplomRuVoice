import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings as SettingsIcon, User, Bell, Lock, Star, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '@/api/users';
import { authAPI } from '@/api/auth';

export default function Settings() {
  const { isDark } = useTheme();
  const { user, logout, setUser: setAuthUser } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [privacyProfile, setPrivacyProfile] = useState(true);
  const [privacyFavorites, setPrivacyFavorites] = useState(true);
  const [showBecomeArtist, setShowBecomeArtist] = useState(false);
  const [showMyData, setShowMyData] = useState(false);
  const [artistForm, setArtistForm] = useState({ artist_name: '', bio: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(null);
  const avatarInputRef = React.useRef(null);
  const bannerInputRef = React.useRef(null);

  useEffect(() => {
    if (!user) return;
    authAPI.getProfile()
      .then((data) => {
        setProfileData(data);
        setEditForm({
          full_name: data?.full_name || '',
          nickname: data?.nickname || '',
          bio: data?.bio || '',
          avatar_url: data?.avatar_url || '',
          banner_url: data?.banner_url || '',
          telegram: data?.telegram || '',
          vk: data?.vk || '',
          youtube: data?.youtube || '',
          website: data?.website || '',
        });
      })
      .catch(() => setProfileData(null));
  }, [user, showMyData]);

  const openMyData = () => {
    const source = profileData || user;
    if (source) {
      setEditForm({
        full_name: source.full_name || '',
        nickname: source.nickname || '',
        bio: source.bio || '',
        avatar_url: source.avatar_url || '',
        banner_url: source.banner_url || '',
        telegram: source.telegram || '',
        vk: source.vk || '',
        youtube: source.youtube || '',
        website: source.website || '',
      });
    }
    setAvatarFile(null);
    setBannerFile(null);
    setAvatarPreviewUrl(null);
    setBannerPreviewUrl(null);
    setShowMyData(true);
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };
  const onBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerFile(file);
    setBannerPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const saveMyData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let updated;
      if (avatarFile || bannerFile) {
        try {
          const formData = new FormData();
          Object.entries(editForm).forEach(([k, v]) => { if (v != null && v !== '') formData.append(k, String(v)); });
          if (avatarFile) formData.append('avatar', avatarFile);
          if (bannerFile) formData.append('banner', bannerFile);
          updated = await usersAPI.updateProfileWithFiles(user.id, formData);
        } catch (_) {
          const payload = { ...editForm };
          if (avatarFile) payload.avatar_url = await fileToDataUrl(avatarFile);
          if (bannerFile) payload.banner_url = await fileToDataUrl(bannerFile);
          updated = await usersAPI.updateProfile(user.id, payload);
        }
      } else {
        updated = await usersAPI.updateProfile(user.id, editForm);
      }
      setProfileData(updated);
      if (setAuthUser) setAuthUser(updated);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
      setAvatarPreviewUrl(null);
      setBannerPreviewUrl(null);
      setAvatarFile(null);
      setBannerFile(null);
      toast.success('Данные сохранены');
      setShowMyData(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Ошибка сохранения');
    } finally {
      setIsLoading(false);
    }
  };

  const becomeArtist = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await usersAPI.requestArtist(user.id, artistForm);
      toast.success('Поздравляем! Теперь вы артист');
      setShowBecomeArtist(false);
      // Временно перезагружаем страницу, чтобы обновить данные пользователя в Layout
      window.location.reload();
    } catch (error) {
      console.error('Artist request failed:', error);
      toast.error(error.message || 'Ошибка при запросе статуса артиста');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark
    ? 'bg-zinc-800/50 backdrop-blur-sm border-zinc-700'
    : 'bg-white/80 backdrop-blur-sm border-gray-200';
  const inputBg = isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900';

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <p className={textSecondary}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-8 pb-32 max-w-3xl mx-auto">
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={cn('text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3', textClass)}>
          <SettingsIcon className="w-8 h-8" />
          Настройки
        </h1>
        <p className={textSecondary}>Управление вашим аккаунтом</p>
      </motion.div>

      <div className="space-y-6">
        {/* Мои данные — кнопка открывает модалку с полной информацией и редактированием */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={cn('border', cardBg)}>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', textClass)}>
                <User className="w-5 h-5" />
                Аккаунт
              </CardTitle>
              <CardDescription className={textSecondary}>
                Просмотр и редактирование ваших данных
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={openMyData}
                variant="outline"
                className="w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Мои данные
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Уведомления */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={cn('border', cardBg)}>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', textClass)}>
                <Bell className="w-5 h-5" />
                Уведомления
              </CardTitle>
              <CardDescription className={textSecondary}>
                Настройте, как вы хотите получать уведомления
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={textClass}>Новые треки от артистов</p>
                  <p className={cn('text-sm', textSecondary)}>Получайте уведомления о новых релизах</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className={textClass}>Комментарии к трекам</p>
                  <p className={cn('text-sm', textSecondary)}>Уведомления о новых комментариях</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Приватность */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={cn('border', cardBg)}>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', textClass)}>
                <Lock className="w-5 h-5" />
                Приватность и безопасность
              </CardTitle>
              <CardDescription className={textSecondary}>
                Управление настройками конфиденциальности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={textClass}>Публичный профиль</p>
                  <p className={cn('text-sm', textSecondary)}>Разрешить другим видеть ваш профиль</p>
                </div>
                <Switch checked={privacyProfile} onCheckedChange={setPrivacyProfile} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className={textClass}>Показывать избранное</p>
                  <p className={cn('text-sm', textSecondary)}>Другие пользователи смогут видеть ваше избранное</p>
                </div>
                <Switch checked={privacyFavorites} onCheckedChange={setPrivacyFavorites} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Стать артистом — только для обычного слушателя (не артист, не админ) */}
        {user.role !== 'artist' && user.role !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className={cn('border', cardBg, 'border-purple-500/20')}>
              <CardHeader>
                <CardTitle className={cn('flex items-center gap-2', textClass)}>
                  <Star className="w-5 h-5 text-purple-500" />
                  Стать артистом
                </CardTitle>
                <CardDescription className={textSecondary}>
                  Загружайте свою музыку и зарабатывайте на прослушиваниях
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Link to="/become-artist">
                    <Star className="w-4 h-4 mr-2" />
                    Стать артистом
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Выход */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className={cn('border', cardBg, 'border-red-500/20')}>
            <CardHeader>
              <CardTitle className="text-red-500">Опасная зона</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full"
              >
                Выйти из аккаунта
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
              disabled={!artistForm.artist_name.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Star className="w-4 h-4 mr-2" />
              {isLoading ? 'Отправка...' : 'Стать артистом'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модалка «Мои данные» — вся информация с возможностью редактирования */}
      <Dialog open={showMyData} onOpenChange={(open) => {
        if (!open) {
          if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
          if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
          setAvatarPreviewUrl(null);
          setBannerPreviewUrl(null);
          setAvatarFile(null);
          setBannerFile(null);
        }
        setShowMyData(open);
      }}>
        <DialogContent className={cn('max-w-lg border max-h-[90vh] overflow-y-auto', cardBg)}>
          <DialogHeader>
            <DialogTitle className={textClass}>Мои данные</DialogTitle>
            <CardDescription className={textSecondary}>
              Просмотр и редактирование профиля
            </CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={textSecondary}>Email</Label>
              <Input value={user?.email || ''} disabled className={cn(isDark ? 'bg-zinc-900' : 'bg-gray-100')} />
            </div>
            <div className="space-y-2">
              <Label className={textSecondary}>Имя</Label>
              <Input
                value={editForm.full_name ?? ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder="Полное имя"
                className={inputBg}
              />
            </div>
            <div className="space-y-2">
              <Label className={textSecondary}>Ник</Label>
              <Input
                value={editForm.nickname ?? ''}
                onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                placeholder="Ник или псевдоним"
                className={inputBg}
              />
            </div>
            <div className="space-y-2">
              <Label className={textSecondary}>О себе</Label>
              <Textarea
                value={editForm.bio ?? ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Биография"
                rows={3}
                className={inputBg}
              />
            </div>
            <div className="space-y-2">
              <Label className={textSecondary}>Аватар</Label>
              <input type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={onAvatarChange} />
              <div
                role="button"
                tabIndex={0}
                onClick={() => avatarInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && avatarInputRef.current?.click()}
                className={cn('w-20 h-20 rounded-lg border-2 border-dashed overflow-hidden shrink-0 cursor-pointer flex items-center justify-center transition-opacity hover:opacity-90', isDark ? 'border-zinc-600 bg-zinc-800' : 'border-gray-300 bg-gray-100')}
              >
                {(avatarPreviewUrl || editForm.avatar_url) ? (
                  <img src={avatarPreviewUrl || editForm.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className={cn('text-xs', textSecondary)}>Выбрать</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className={textSecondary}>Шапка профиля</Label>
              <input type="file" accept="image/*" className="hidden" ref={bannerInputRef} onChange={onBannerChange} />
              <div
                role="button"
                tabIndex={0}
                onClick={() => bannerInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && bannerInputRef.current?.click()}
                className={cn('w-full h-20 rounded-lg border-2 border-dashed overflow-hidden cursor-pointer flex items-center justify-center transition-opacity hover:opacity-90', isDark ? 'border-zinc-600 bg-zinc-800' : 'border-gray-300 bg-gray-100')}
              >
                {(bannerPreviewUrl || editForm.banner_url) ? (
                  <img src={bannerPreviewUrl || editForm.banner_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className={cn('text-xs', textSecondary)}>Нажмите, чтобы выбрать изображение</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className={textSecondary}>Telegram</Label>
                <Input value={editForm.telegram ?? ''} onChange={(e) => setEditForm({ ...editForm, telegram: e.target.value })} placeholder="@nick" className={inputBg} />
              </div>
              <div className="space-y-2">
                <Label className={textSecondary}>VK</Label>
                <Input value={editForm.vk ?? ''} onChange={(e) => setEditForm({ ...editForm, vk: e.target.value })} placeholder="vk.com/..." className={inputBg} />
              </div>
              <div className="space-y-2">
                <Label className={textSecondary}>YouTube</Label>
                <Input value={editForm.youtube ?? ''} onChange={(e) => setEditForm({ ...editForm, youtube: e.target.value })} placeholder="youtube.com/..." className={inputBg} />
              </div>
              <div className="space-y-2">
                <Label className={textSecondary}>Сайт</Label>
                <Input value={editForm.website ?? ''} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} placeholder="https://..." className={inputBg} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowMyData(false)}>Закрыть</Button>
              <Button onClick={saveMyData} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}