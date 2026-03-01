import React, { useState } from 'react';
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
import { Upload, Music, Image, Info, FileText, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
  KEYS,
  MOODS,
  RELEASE_TYPES,
  LANGUAGES,
  MOCK_ALBUMS,
} from '@/mocks/uploadFormData';

export default function UploadTrack({ isDark: isDarkProp }) {
  const { isDark: isDarkContext } = useTheme();
  const isDark = isDarkProp ?? isDarkContext ?? true;

  const [loading, setLoading] = useState(false);
  const [createNewAlbum, setCreateNewAlbum] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [extraAuthors, setExtraAuthors] = useState([]);

  const [form, setForm] = useState({
    title: '',
    artistName: 'Мой псевдоним',
    albumId: '',
    newAlbumTitle: '',
    newAlbumType: 'single',
    releaseType: 'single', // сингл / альбом / EP
    language: 'ru',
    lyrics: '',
    authorLyrics: '',      // автор текста
    authorBeat: '',       // автор бита
    authorComposer: '',   // автор всего (композитор)
    copyright: '',
    releaseDate: '',
    presaveUrl: '',       // ссылка на пресейв (Spotify, Apple Music и т.д.)
    bpm: '',
    key: '',
    mood: [],
    tags: '',
    explicit: false,
    isrc: '',
  });

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-zinc-900/80 border-zinc-700' : 'bg-white/80 border-gray-200';
  const labelClass = isDark ? 'text-zinc-300' : 'text-gray-700';
  const inputClass = isDark
    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400';
  const borderDashed = isDark
    ? 'border-zinc-700 hover:border-zinc-500'
    : 'border-gray-300 hover:border-gray-400';

  const handleAlbumChange = (v) => {
    setForm((f) => ({ ...f, albumId: v }));
    setCreateNewAlbum(v === 'new');
  };

  const handleCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAudio = (e) => {
    const file = e.target.files?.[0];
    setAudioFile(file || null);
  };

  const addAuthor = () => {
    setExtraAuthors((prev) => [...prev, { role: '', name: '' }]);
  };

  const toggleMood = (value) => {
    setForm((f) => ({
      ...f,
      mood: f.mood.includes(value) ? f.mood.filter((m) => m !== value) : [...f.mood, value],
    }));
  };

  const handleSubmit = (draft = false) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className={cn('text-2xl sm:text-3xl font-bold mb-6', textClass)}>
          Загрузка трека
        </h1>

        <Card className={cn(cardBg)}>
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', textClass)}>
              <Upload className="w-5 h-5" />
              Новая запись
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="main" className="w-full">
              <TabsList
                className={cn(
                  'w-full grid grid-cols-2 sm:grid-cols-4 mb-4',
                  isDark ? 'bg-zinc-800' : 'bg-gray-100'
                )}
              >
                <TabsTrigger value="main" className="flex items-center gap-1.5">
                  <Info className="h-4 w-4" /> Основное
                </TabsTrigger>
                <TabsTrigger value="meta">Метаданные</TabsTrigger>
                <TabsTrigger value="authors" className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Авторы
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> Файлы
                </TabsTrigger>
              </TabsList>

              {/* Вкладка: Основная информация — обложка, тип, альбом, текст, авторы, дата, пресейв */}
              <TabsContent value="main" className="space-y-4">
                {/* 1. Обложка */}
                <div className="space-y-2">
                  <Label className={labelClass}>Обложка *</Label>
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors',
                      borderDashed
                    )}
                    onClick={() => document.getElementById('cover-upload-main')?.click()}
                  >
                    <input
                      id="cover-upload-main"
                      type="file"
                      accept="image/*"
                      onChange={handleCover}
                      className="hidden"
                    />
                    {coverPreview ? (
                      <img src={coverPreview} alt="Обложка" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-lg object-cover" />
                    ) : (
                      <>
                        <Image className={cn('w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2', textSecondary)} />
                        <p className={cn('text-sm', textSecondary)}>Клик или перетащите изображение</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Тип релиза (сингл / альбом / EP) */}
                <div className="space-y-2">
                  <Label className={labelClass}>Тип релиза *</Label>
                  <Select
                    value={form.releaseType}
                    onValueChange={(v) => setForm({ ...form, releaseType: v })}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Сингл / Альбом / EP" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELEASE_TYPES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Выбор альбома (если не сингл) */}
                {(form.releaseType === 'album' || form.releaseType === 'ep') && (
                  <div className="space-y-2">
                    <Label className={labelClass}>Альбом</Label>
                    <Select value={form.albumId} onValueChange={handleAlbumChange}>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder="Выберите или создайте альбом" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_ALBUMS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {createNewAlbum && (
                      <div className={cn('p-3 rounded-lg space-y-2 mt-2', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
                        <Input
                          value={form.newAlbumTitle}
                          onChange={(e) => setForm({ ...form, newAlbumTitle: e.target.value })}
                          placeholder="Название альбома"
                          className={inputClass}
                        />
                        <Select
                          value={form.newAlbumType}
                          onValueChange={(v) => setForm({ ...form, newAlbumType: v })}
                        >
                          <SelectTrigger className={inputClass}>
                            <SelectValue placeholder="Тип альбома" />
                          </SelectTrigger>
                          <SelectContent>
                            {RELEASE_TYPES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className={labelClass}>Название трека *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Название"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artistName" className={labelClass}>Исполнитель</Label>
                    <Input
                      id="artistName"
                      value={form.artistName}
                      onChange={(e) => setForm({ ...form, artistName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* 4. Текст трека */}
                <div className="space-y-2">
                  <Label htmlFor="lyrics" className={labelClass}>Текст песни</Label>
                  <Textarea
                    id="lyrics"
                    value={form.lyrics}
                    onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
                    placeholder="Текст трека..."
                    className={cn(inputClass, 'min-h-[120px]')}
                  />
                </div>

                {/* 5–7. Авторы: текст, бит, всё */}
                <div className={cn('p-4 rounded-lg space-y-3', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
                  <p className={cn('text-sm font-medium', labelClass)}>Авторы</p>
                  <div className="space-y-2">
                    <Input
                      value={form.authorLyrics}
                      onChange={(e) => setForm({ ...form, authorLyrics: e.target.value })}
                      placeholder="Автор текста (кто написал слова)"
                      className={inputClass}
                    />
                    <Input
                      value={form.authorBeat}
                      onChange={(e) => setForm({ ...form, authorBeat: e.target.value })}
                      placeholder="Автор бита (продюсер)"
                      className={inputClass}
                    />
                    <Input
                      value={form.authorComposer}
                      onChange={(e) => setForm({ ...form, authorComposer: e.target.value })}
                      placeholder="Автор всего / композитор"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* 8. Дата релиза */}
                <div className="space-y-2">
                  <Label htmlFor="releaseDate" className={labelClass}>Дата релиза *</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={form.releaseDate}
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* 9. Пресейв */}
                <div className="space-y-2">
                  <Label htmlFor="presaveUrl" className={labelClass}>Ссылка на пресейв</Label>
                  <Input
                    id="presaveUrl"
                    type="url"
                    value={form.presaveUrl}
                    onChange={(e) => setForm({ ...form, presaveUrl: e.target.value })}
                    placeholder="https://... (Spotify, Apple Music, и т.д.)"
                    className={inputClass}
                  />
                  <p className={cn('text-xs', textSecondary)}>Ссылка для предзаказа или пресейва на стриминговых платформах</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={labelClass}>Язык</Label>
                    <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                      <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Вкладка: Дополнительные метаданные */}
              <TabsContent value="meta" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bpm" className={labelClass}>BPM</Label>
                    <Input
                      id="bpm"
                      type="number"
                      min={1}
                      max={300}
                      value={form.bpm}
                      onChange={(e) => setForm({ ...form, bpm: e.target.value })}
                      placeholder="120"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Тональность</Label>
                    <Select
                      value={form.key}
                      onValueChange={(v) => setForm({ ...form, key: v })}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder="Выберите" />
                      </SelectTrigger>
                      <SelectContent>
                        {KEYS.map((k) => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Настроение</Label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <label
                        key={m.value}
                        className={cn(
                          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-sm transition-colors',
                          form.mood.includes(m.value)
                            ? isDark ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-purple-100 border-purple-300 text-purple-700'
                            : isDark ? 'border-zinc-600 text-zinc-400 hover:border-zinc-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={form.mood.includes(m.value)}
                          onChange={() => toggleMood(m.value)}
                          className="sr-only"
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags" className={labelClass}>Теги (через запятую)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="поп, 2024, лето"
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="explicit" className={labelClass}>
                    Содержит ненормативную лексику (Explicit)
                  </Label>
                  <Switch
                    id="explicit"
                    checked={form.explicit}
                    onCheckedChange={(v) => setForm({ ...form, explicit: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isrc" className={labelClass}>ISRC (опционально)</Label>
                  <Input
                    id="isrc"
                    value={form.isrc}
                    onChange={(e) => setForm({ ...form, isrc: e.target.value })}
                    placeholder="USRC17607839"
                    className={inputClass}
                  />
                </div>
              </TabsContent>

              {/* Вкладка: Авторы и права (дополнительные) */}
              <TabsContent value="authors" className="space-y-4">
                <p className={cn('text-sm', textSecondary)}>
                  Основные авторы (текст, бит, композитор) указаны во вкладке «Основное». Здесь — дополнительные участники и права.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="copyright" className={labelClass}>Информация об авторских правах</Label>
                  <Textarea
                    id="copyright"
                    value={form.copyright}
                    onChange={(e) => setForm({ ...form, copyright: e.target.value })}
                    placeholder="© 2024 Правообладатель"
                    className={cn(inputClass, 'min-h-[80px]')}
                  />
                </div>
                {extraAuthors.map((_, i) => (
                  <div key={i} className={cn('p-3 rounded-lg space-y-2', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
                    <Input
                      placeholder="Роль (например: сведение, мастеринг)"
                      value={extraAuthors[i]?.role}
                      onChange={(e) => {
                        const next = [...extraAuthors];
                        next[i] = { ...next[i], role: e.target.value };
                        setExtraAuthors(next);
                      }}
                      className={inputClass}
                    />
                    <Input
                      placeholder="Имя"
                      value={extraAuthors[i]?.name}
                      onChange={(e) => {
                        const next = [...extraAuthors];
                        next[i] = { ...next[i], name: e.target.value };
                        setExtraAuthors(next);
                      }}
                      className={inputClass}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addAuthor}>
                  Добавить ещё участника
                </Button>
              </TabsContent>

              {/* Вкладка: Аудиофайл */}
              <TabsContent value="files" className="space-y-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Аудиофайл *</Label>
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                      borderDashed
                    )}
                    onClick={() => document.getElementById('audio-upload')?.click()}
                  >
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleAudio}
                      className="hidden"
                    />
                    <Music className={cn('w-12 h-12 mx-auto mb-2', textSecondary)} />
                    {audioFile ? (
                      <p className={cn('text-sm', isDark ? 'text-green-400' : 'text-green-600')}>
                        {audioFile.name} ({(audioFile.size / 1024).toFixed(1)} КБ)
                      </p>
                    ) : (
                      <p className={cn('text-sm', textSecondary)}>Клик или перетащите аудио</p>
                    )}
                  </div>
                </div>
                <p className={cn('text-xs', textSecondary)}>Обложка, дата релиза и остальные поля — во вкладке «Основное»</p>
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-2 mt-6">
              <Button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Отправка...</>
                ) : (
                  <>Отправить на модерацию</>
                )}
              </Button>
              <Button variant="outline" onClick={() => handleSubmit(true)} disabled={loading}>
                Сохранить черновик
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
