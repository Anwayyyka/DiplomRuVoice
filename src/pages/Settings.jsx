import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings as SettingsIcon, User, Bell, Lock, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '@/api/users';

export default function Settings() {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [privacyProfile, setPrivacyProfile] = useState(true);
  const [privacyFavorites, setPrivacyFavorites] = useState(true);
  const [showBecomeArtist, setShowBecomeArtist] = useState(false);
  const [artistForm, setArtistForm] = useState({ artist_name: '', bio: '' });
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="relative min-h-screen p-8 pb-32 max-w-3xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={cn('text-4xl font-bold mb-2 flex items-center gap-3', textClass)}>
          <SettingsIcon className="w-8 h-8" />
          Настройки
        </h1>
        <p className={textSecondary}>Управление вашим аккаунтом</p>
      </motion.div>

      <div className="space-y-6">
        {/* Аккаунт */}
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
                Информация о вашем аккаунте
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className={textSecondary}>Email</Label>
                <Input value={user.email} disabled className={cn('mt-1', isDark ? 'bg-zinc-900' : 'bg-gray-100')} />
              </div>
              <div>
                <Label className={textSecondary}>Имя</Label>
                <Input value={user.full_name || ''} disabled className={cn('mt-1', isDark ? 'bg-zinc-900' : 'bg-gray-100')} />
              </div>
              <div>
                <Label className={textSecondary}>Роль</Label>
                <Input
                  value={user.role === 'artist' ? 'Артист' : user.role === 'admin' ? 'Администратор' : 'Слушатель'}
                  disabled
                  className={cn('mt-1', isDark ? 'bg-zinc-900' : 'bg-gray-100')}
                />
              </div>
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
    </div>
  );
}