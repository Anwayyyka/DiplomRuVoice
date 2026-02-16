import React, { useState } from 'react';
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
import { uploadFile, createTrack } from '@/api/tracks'; // импорт API-функций

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

export default function UploadTrackForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    artist_name: '',
    genre: '',
    description: '',
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
      // Загружаем аудио
      const audioResult = await uploadFile(audioFile, 'audio');

      // Загружаем обложку, если есть
      let coverUrl = null;
      if (coverFile) {
        const coverResult = await uploadFile(coverFile, 'image');
        coverUrl = coverResult.url;
      }

      // Создаём трек
      await createTrack({
        ...formData,
        audio_url: audioResult.url,
        cover_url: coverUrl,
        status: 'pending',
      });

      toast.success('Трек отправлен на модерацию!');
      onSuccess?.();

      // Сброс формы
      setFormData({ title: '', artist_name: '', genre: '', description: '' });
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
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Загрузить трек
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Audio Upload */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Аудиофайл *</Label>
            <div
              className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors cursor-pointer"
              onClick={() => document.getElementById('audio-upload').click()}
            >
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
              />
              <Music className="w-12 h-12 mx-auto text-zinc-500 mb-3" />
              {audioFile ? (
                <p className="text-green-500">{audioFile.name}</p>
              ) : (
                <p className="text-zinc-400">Нажмите для выбора аудиофайла</p>
              )}
            </div>
          </div>

          {/* Cover Upload */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Обложка</Label>
            <div
              className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors cursor-pointer"
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
                <img src={coverPreview} alt="Cover" className="w-32 h-32 mx-auto rounded-lg object-cover" />
              ) : (
                <>
                  <Image className="w-12 h-12 mx-auto text-zinc-500 mb-3" />
                  <p className="text-zinc-400">Нажмите для выбора обложки</p>
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-zinc-300">
                Название *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Название трека"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist" className="text-zinc-300">
                Исполнитель *
              </Label>
              <Input
                id="artist"
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                placeholder="Имя исполнителя"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Жанр</Label>
            <Select
              value={formData.genre}
              onValueChange={(value) => setFormData({ ...formData, genre: value })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
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
            <Label htmlFor="description" className="text-zinc-300">
              Описание
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Расскажите о треке..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-24"
            />
          </div>

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