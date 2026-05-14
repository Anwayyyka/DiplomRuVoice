import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Music, Image, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { tracksAPI } from '@/api/tracks';
import { RELEASE_TYPES } from '@/mocks/uploadFormData';

const genres = [
  { value: 'pop', label: 'Поп' },
  { value: 'rock', label: 'Рок' },
  { value: 'hip-hop', label: 'Хип-хоп' },
  { value: 'electronic', label: 'Электроника' },
  { value: 'jazz', label: 'Джаз' },
  { value: 'classical', label: 'Классика' },
  { value: 'folk', label: 'Фолк' },
  { value: 'indie', label: 'Инди' },
  { value: 'r&b', label: 'R&B' },
  { value: 'metal', label: 'Метал' },
  { value: 'other', label: 'Другое' },
];

const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;  // 2 MB

export default function UploadTrackForm({ onSuccess, isDark = true }) {
  const [formData, setFormData] = useState({
    title: '',
    artist_name: '',
    genre: '',
    description: '',
    release_type: 'single',
    lyrics: '',
    author_lyrics: '',
    author_beat: '',
    author_composer: '',
    release_date: '',
    presave_url: '',
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Классы для стилизации в зависимости от темы
  const cardBg = isDark
    ? 'bg-zinc-900/50 border-zinc-800'
    : 'bg-white/80 border-gray-200';
  const cardTitleClass = isDark ? 'text-white' : 'text-gray-900';
  const labelClass = isDark ? 'text-zinc-300' : 'text-gray-700';
  const textMuted = isDark ? 'text-zinc-400' : 'text-gray-500';
  const textSuccess = isDark ? 'text-green-500' : 'text-green-600';
  const borderDashed = isDark
    ? 'border-zinc-700 hover:border-zinc-500'
    : 'border-gray-300 hover:border-gray-400';
  const inputClass = isDark
    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400';
  const selectTriggerClass = isDark
    ? 'bg-zinc-800 border-zinc-700 text-white'
    : 'bg-white border-gray-300 text-gray-900';
  const textareaClass = isDark
    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-24'
    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-24';

  const validateFile = (file, maxSize, allowedTypes, fileType) => {
    if (!file) return false;
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Пожалуйста, выберите файл типа ${fileType}`);
      return false;
    }
    if (file.size > maxSize) {
      toast.error(`Размер файла не должен превышать ${maxSize / (1024 * 1024)} МБ`);
      return false;
    }
    return true;
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file, MAX_AUDIO_SIZE, ['audio/mpeg', 'audio/wav', 'audio/mp3'], 'аудио')) {
      setAudioFile(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file, MAX_IMAGE_SIZE, ['image/jpeg', 'image/png', 'image/webp'], 'изображение')) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      toast.error('Пожалуйста, загрузите аудиофайл');
      return;
    }
    if (!formData.title || !formData.artist_name) {
      toast.error('Заполните название и имя исполнителя');
      return;
    }

    setIsUploading(true);

    try {
      // Создаём FormData для отправки
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('artist_name', formData.artist_name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('release_type', formData.release_type);
      formDataToSend.append('lyrics', formData.lyrics);
      formDataToSend.append('author_lyrics', formData.author_lyrics);
      formDataToSend.append('author_beat', formData.author_beat);
      formDataToSend.append('author_composer', formData.author_composer);
      formDataToSend.append('release_date', formData.release_date);
      formDataToSend.append('presave_url', formData.presave_url);
      if (formData.genre) {
        formDataToSend.append('genre_id', formData.genre);
      }
      formDataToSend.append('audio', audioFile);
      if (coverFile) {
        formDataToSend.append('cover', coverFile);
      }

      // Отправляем одним запросом
      const result = await tracksAPI.uploadTrack(formDataToSend);

      toast.success('Трек отправлен на модерацию!');
      onSuccess?.(result);

      // Сброс формы
      setFormData({
        title: '', artist_name: '', genre: '', description: '',
        release_type: 'single', lyrics: '', author_lyrics: '', author_beat: '', author_composer: '',
        release_date: '', presave_url: '',
      });
      setAudioFile(null);
      setCoverFile(null);
      setCoverPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Ошибка при загрузке трека');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className={cn('border', cardBg)}>
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2', cardTitleClass)}>
          <Upload className="w-5 h-5" />
          Загрузить трек
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Audio Upload */}
          <div className="space-y-2">
            <Label className={labelClass}>Аудиофайл *</Label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                borderDashed
              )}
              onClick={() => document.getElementById('audio-upload').click()}
            >
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
              />
              <Music className={cn('w-12 h-12 mx-auto mb-3', textMuted)} />
              {audioFile ? (
                <p className={textSuccess}>{audioFile.name}</p>
              ) : (
                <p className={textMuted}>Нажмите для выбора аудиофайла</p>
              )}
            </div>
          </div>

          {/* Cover Upload */}
          <div className="space-y-2">
            <Label className={labelClass}>Обложка</Label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                borderDashed
              )}
              onClick={() => document.getElementById('cover-upload').click()}
            >
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-32 h-32 mx-auto rounded-lg object-cover"
                />
              ) : (
                <>
                  <Image className={cn('w-12 h-12 mx-auto mb-3', textMuted)} />
                  <p className={textMuted}>Нажмите для выбора обложки</p>
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-2">
            <Label className={labelClass}>Тип релиза</Label>
            <Select
              value={formData.release_type}
              onValueChange={(v) => setFormData({ ...formData, release_type: v })}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Сингл / Альбом / EP" />
              </SelectTrigger>
              <SelectContent>
                {RELEASE_TYPES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" className={labelClass}>Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Название трека"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist" className={labelClass}>Исполнитель *</Label>
              <Input
                id="artist"
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                placeholder="Имя исполнителя"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lyrics" className={labelClass}>Текст песни</Label>
            <Textarea
              id="lyrics"
              value={formData.lyrics}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              placeholder="Текст трека..."
              className={textareaClass}
            />
          </div>

          <div className={cn('p-3 rounded-lg space-y-2', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
            <p className={cn('text-sm font-medium', labelClass)}>Авторы</p>
            <Input
              value={formData.author_lyrics}
              onChange={(e) => setFormData({ ...formData, author_lyrics: e.target.value })}
              placeholder="Автор текста"
              className={inputClass}
            />
            <Input
              value={formData.author_beat}
              onChange={(e) => setFormData({ ...formData, author_beat: e.target.value })}
              placeholder="Автор бита (продюсер)"
              className={inputClass}
            />
            <Input
              value={formData.author_composer}
              onChange={(e) => setFormData({ ...formData, author_composer: e.target.value })}
              placeholder="Автор всего / композитор"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="release_date" className={labelClass}>Дата релиза</Label>
            <Input
              id="release_date"
              type="date"
              value={formData.release_date}
              onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="presave_url" className={labelClass}>Ссылка на пресейв</Label>
            <Input
              id="presave_url"
              type="url"
              value={formData.presave_url}
              onChange={(e) => setFormData({ ...formData, presave_url: e.target.value })}
              placeholder="https://... (Spotify, Apple Music)"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label className={labelClass}>Жанр</Label>
            <Select
              value={formData.genre}
              onValueChange={(value) => setFormData({ ...formData, genre: value })}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Выберите жанр" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre.value} value={genre.value}>
                    {genre.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className={labelClass}>Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Расскажите о треке..."
              className={textareaClass}
            />
          </div>

          <p className={cn('text-xs', textMuted)}>
            Для расширенной формы (BPM, тональность, ISRC и т.д.) используйте{' '}
            <Link to="/upload" className="underline text-purple-400 hover:text-purple-300">
              страницу загрузки
            </Link>.
          </p>

          <Button
            type="submit"
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Отправить на модерацию
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}