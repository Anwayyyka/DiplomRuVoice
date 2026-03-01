import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Upload as UploadIcon,
  Music,
  Image,
  Loader2,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Disc,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { tracksAPI } from '@/api/tracks';
import { toast } from 'sonner';
import { RELEASE_TYPES } from '@/mocks/uploadFormData';

const statusConfig = {
  pending: { label: 'На модерации', icon: Clock, color: 'bg-yellow-500/20 text-yellow-500' },
  approved: { label: 'Опубликован', icon: CheckCircle, color: 'bg-green-500/20 text-green-500' },
  rejected: { label: 'Отклонён', icon: XCircle, color: 'bg-red-500/20 text-red-500' },
};

const emptyTrack = () => ({
  title: '',
  audioFile: null,
  lyrics: '',
  authorLyrics: '',
  authorBeat: '',
  authorComposer: '',
});

export default function Upload() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [myTracks, setMyTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [error, setError] = useState(null);

  const [releaseType, setReleaseType] = useState('single');
  const [albumName, setAlbumName] = useState('');
  const [albumCover, setAlbumCover] = useState(null);
  const [albumCoverPreview, setAlbumCoverPreview] = useState(null);
  const [albumReleaseDate, setAlbumReleaseDate] = useState('');
  const [albumPresaveUrl, setAlbumPresaveUrl] = useState('');

  const [singleForm, setSingleForm] = useState({
    title: '',
    artistName: 'Мой псевдоним',
    coverPreview: null,
    coverFile: null,
    audioFile: null,
    lyrics: '',
    authorLyrics: '',
    authorBeat: '',
    authorComposer: '',
    releaseDate: '',
    presaveUrl: '',
    language: 'ru',
    copyright: '',
    explicit: false,
  });

  const [albumTracks, setAlbumTracks] = useState([emptyTrack()]);

  const fetchMyTracks = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingTracks(true);
      const tracks = await tracksAPI.getArtistTracks(user.id);
      setMyTracks(Array.isArray(tracks) ? tracks : []);
    } catch (err) {
      console.error('Failed to load user tracks:', err);
      setError('Не удалось загрузить ваши треки');
      setMyTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyTracks();
  }, [fetchMyTracks]);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-zinc-900/80 border-zinc-700' : 'bg-white/80 border-gray-300';
  const labelClass = isDark ? 'text-zinc-300' : 'text-gray-700';
  const inputClass = isDark
    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400';
  const borderDashed = isDark
    ? 'border-zinc-700 hover:border-zinc-500'
    : 'border-gray-300 hover:border-gray-400';

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата неизвестна';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? 'Дата неизвестна' : format(d, 'd MMM yyyy', { locale: ru });
  };

  const handleSingleCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSingleForm((f) => ({ ...f, coverPreview: reader.result, coverFile: file }));
    reader.readAsDataURL(file);
  };

  const handleAlbumCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAlbumCover(file);
      setAlbumCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addAlbumTrack = () => {
    setAlbumTracks((prev) => [...prev, emptyTrack()]);
  };

  const removeAlbumTrack = (index) => {
    if (albumTracks.length <= 1) return;
    setAlbumTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAlbumTrack = (index, field, value) => {
    setAlbumTracks((prev) => {
      const next = [...prev];
      if (field === 'audioFile') {
        next[index] = { ...next[index], audioFile: value };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Имитация отправки (заглушка)
    setTimeout(() => {
      setLoading(false);
      toast.success(releaseType === 'single' ? 'Трек отправлен на модерацию!' : 'Альбом отправлен на модерацию!');
      fetchMyTracks();
      setActiveTab('tracks');
    }, 1200);
  };

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Card className={cn('max-w-md', cardBg)}>
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 mx-auto text-zinc-500 mb-4" />
            <h2 className={cn('text-xl font-semibold mb-2', textClass)}>Войдите в аккаунт</h2>
            <p className={textSecondary}>Чтобы загружать треки, необходимо авторизоваться</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 sm:p-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className={cn('text-2xl sm:text-3xl font-bold mb-6', textClass)}>Загрузить музыку</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn('grid w-full grid-cols-2 mb-6', isDark ? 'bg-zinc-800' : 'bg-gray-100')}>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadIcon className="h-4 w-4" /> Загрузить
            </TabsTrigger>
            <TabsTrigger value="tracks" className="flex items-center gap-2">
              <Disc className="h-4 w-4" /> Мои треки ({myTracks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className={cn(cardBg)}>
              <CardHeader>
                <CardTitle className={cn('flex items-center gap-2', textClass)}>Новая запись</CardTitle>
                <p className={cn('text-sm', textSecondary)}>Сингл, альбом или EP</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. Тип релиза */}
                <div className="space-y-2">
                  <Label className={labelClass}>Тип релиза</Label>
                  <Select value={releaseType} onValueChange={setReleaseType}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELEASE_TYPES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Альбом / EP: название + обложка */}
                {(releaseType === 'album' || releaseType === 'ep') && (
                  <div className={cn('p-4 rounded-lg space-y-4', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
                    <p className={cn('text-sm font-medium', labelClass)}>Данные альбома</p>
                    <div className="space-y-2">
                      <Label className={labelClass}>Название альбома *</Label>
                      <Input
                        value={albumName}
                        onChange={(e) => setAlbumName(e.target.value)}
                        placeholder="Название альбома"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className={labelClass}>Дата релиза альбома</Label>
                        <Input
                          type="date"
                          value={albumReleaseDate}
                          onChange={(e) => setAlbumReleaseDate(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={labelClass}>Пресейв альбома</Label>
                        <Input
                          type="url"
                          value={albumPresaveUrl}
                          onChange={(e) => setAlbumPresaveUrl(e.target.value)}
                          placeholder="https://..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClass}>Обложка альбома *</Label>
                      <div
                        className={cn(
                          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                          borderDashed
                        )}
                        onClick={() => document.getElementById('album-cover')?.click()}
                      >
                        <input
                          id="album-cover"
                          type="file"
                          accept="image/*"
                          onChange={handleAlbumCover}
                          className="hidden"
                        />
                        {albumCoverPreview ? (
                          <img src={albumCoverPreview} alt="Обложка" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-lg object-cover" />
                        ) : (
                          <>
                            <Image className={cn('w-10 h-10 mx-auto mb-2', textSecondary)} />
                            <p className={cn('text-sm', textSecondary)}>Клик для выбора обложки</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Сингл: обложка + все поля одного трека */}
                {releaseType === 'single' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className={labelClass}>Обложка *</Label>
                      <div
                        className={cn(
                          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                          borderDashed
                        )}
                        onClick={() => document.getElementById('single-cover')?.click()}
                      >
                        <input
                          id="single-cover"
                          type="file"
                          accept="image/*"
                          onChange={handleSingleCover}
                          className="hidden"
                        />
                        {singleForm.coverPreview ? (
                          <img src={singleForm.coverPreview} alt="Обложка" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-lg object-cover" />
                        ) : (
                          <>
                            <Image className={cn('w-10 h-10 mx-auto mb-2', textSecondary)} />
                            <p className={cn('text-sm', textSecondary)}>Клик для выбора обложки</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className={labelClass}>Название трека *</Label>
                        <Input
                          value={singleForm.title}
                          onChange={(e) => setSingleForm((f) => ({ ...f, title: e.target.value }))}
                          placeholder="Название"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={labelClass}>Исполнитель</Label>
                        <Input
                          value={singleForm.artistName}
                          onChange={(e) => setSingleForm((f) => ({ ...f, artistName: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClass}>Текст песни</Label>
                      <Textarea
                        value={singleForm.lyrics}
                        onChange={(e) => setSingleForm((f) => ({ ...f, lyrics: e.target.value }))}
                        placeholder="Текст трека..."
                        className={cn(inputClass, 'min-h-[100px]')}
                      />
                    </div>
                    <div className={cn('p-4 rounded-lg space-y-2', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
                      <p className={cn('text-sm font-medium', labelClass)}>Авторы</p>
                      <Input
                        value={singleForm.authorLyrics}
                        onChange={(e) => setSingleForm((f) => ({ ...f, authorLyrics: e.target.value }))}
                        placeholder="Автор текста"
                        className={inputClass}
                      />
                      <Input
                        value={singleForm.authorBeat}
                        onChange={(e) => setSingleForm((f) => ({ ...f, authorBeat: e.target.value }))}
                        placeholder="Автор бита (продюсер)"
                        className={inputClass}
                      />
                      <Input
                        value={singleForm.authorComposer}
                        onChange={(e) => setSingleForm((f) => ({ ...f, authorComposer: e.target.value }))}
                        placeholder="Автор всего / композитор"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className={labelClass}>Дата релиза</Label>
                        <Input
                          type="date"
                          value={singleForm.releaseDate}
                          onChange={(e) => setSingleForm((f) => ({ ...f, releaseDate: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={labelClass}>Ссылка на пресейв</Label>
                        <Input
                          type="url"
                          value={singleForm.presaveUrl}
                          onChange={(e) => setSingleForm((f) => ({ ...f, presaveUrl: e.target.value }))}
                          placeholder="https://..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClass}>Аудиофайл *</Label>
                      <div
                        className={cn(
                          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                          borderDashed
                        )}
                        onClick={() => document.getElementById('single-audio')?.click()}
                      >
                        <input
                          id="single-audio"
                          type="file"
                          accept="audio/*"
                          onChange={(e) => setSingleForm((f) => ({ ...f, audioFile: e.target.files?.[0] || null }))}
                          className="hidden"
                        />
                        <Music className={cn('w-12 h-12 mx-auto mb-2', textSecondary)} />
                        {singleForm.audioFile ? (
                          <p className={cn('text-sm', isDark ? 'text-green-400' : 'text-green-600')}>
                            {singleForm.audioFile.name} ({(singleForm.audioFile.size / 1024).toFixed(1)} КБ)
                          </p>
                        ) : (
                          <p className={cn('text-sm', textSecondary)}>Клик для выбора аудио</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Альбом / EP: несколько треков */}
                {(releaseType === 'album' || releaseType === 'ep') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className={labelClass}>Треки альбома</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addAlbumTrack}>
                        <Plus className="h-4 w-4 mr-1" /> Добавить трек
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {albumTracks.map((track, index) => (
                        <div
                          key={index}
                          className={cn(
                            'p-4 rounded-lg border space-y-3',
                            isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-100 border-gray-200'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn('text-sm font-medium', labelClass)}>Трек {index + 1}</span>
                            {albumTracks.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => removeAlbumTrack(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Input
                              value={track.title}
                              onChange={(e) => updateAlbumTrack(index, 'title', e.target.value)}
                              placeholder="Название трека"
                              className={inputClass}
                            />
                            <div
                              className={cn(
                                'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                                borderDashed
                              )}
                              onClick={() => document.getElementById(`album-audio-${index}`)?.click()}
                            >
                              <input
                                id={`album-audio-${index}`}
                                type="file"
                                accept="audio/*"
                                onChange={(e) => updateAlbumTrack(index, 'audioFile', e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <Music className={cn('w-8 h-8 mx-auto mb-1', textSecondary)} />
                              {track.audioFile ? (
                                <p className={cn('text-xs', isDark ? 'text-green-400' : 'text-green-600')}>
                                  {track.audioFile.name}
                                </p>
                              ) : (
                                <p className={cn('text-xs', textSecondary)}>Аудиофайл *</p>
                              )}
                            </div>
                            <Textarea
                              value={track.lyrics}
                              onChange={(e) => updateAlbumTrack(index, 'lyrics', e.target.value)}
                              placeholder="Текст (опционально)"
                              className={cn(inputClass, 'min-h-[60px]')}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <Input
                                value={track.authorLyrics}
                                onChange={(e) => updateAlbumTrack(index, 'authorLyrics', e.target.value)}
                                placeholder="Автор текста"
                                className={inputClass}
                              />
                              <Input
                                value={track.authorBeat}
                                onChange={(e) => updateAlbumTrack(index, 'authorBeat', e.target.value)}
                                placeholder="Автор бита"
                                className={inputClass}
                              />
                              <Input
                                value={track.authorComposer}
                                onChange={(e) => updateAlbumTrack(index, 'authorComposer', e.target.value)}
                                placeholder="Композитор"
                                className={inputClass}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="explicit"
                      checked={releaseType === 'single' ? singleForm.explicit : false}
                      onCheckedChange={(v) => releaseType === 'single' && setSingleForm((f) => ({ ...f, explicit: v }))}
                    />
                    <Label htmlFor="explicit" className={labelClass}>Explicit</Label>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Отправка...</>
                    ) : (
                      <>Отправить на модерацию</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracks" className="space-y-4">
            <Card className={cn(cardBg)}>
              <CardHeader>
                <CardTitle className={textClass}>Мои треки</CardTitle>
                <p className={cn('text-sm', textSecondary)}>Статус ваших загруженных треков</p>
              </CardHeader>
              <CardContent>
                {loadingTracks ? (
                  <p className={textSecondary}>Загрузка...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : myTracks.length === 0 ? (
                  <p className={cn('text-center py-8', textSecondary)}>Вы ещё не загружали треки</p>
                ) : (
                  <div className="space-y-3">
                    {myTracks.map((track) => {
                      const status = statusConfig[track.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      return (
                        <div
                          key={track.id}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg',
                            isDark ? 'bg-zinc-800/50' : 'bg-gray-100/50'
                          )}
                        >
                          <img
                            src={track.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop'}
                            alt={track.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn('font-medium truncate', textClass)}>{track.title}</p>
                            <p className={cn('text-sm', textSecondary)}>
                              {formatDate(track.created_at || track.created_date)}
                            </p>
                            {track.status === 'rejected' && track.rejection_reason && (
                              <p className="text-sm text-red-400 mt-1">Причина: {track.rejection_reason}</p>
                            )}
                          </div>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
