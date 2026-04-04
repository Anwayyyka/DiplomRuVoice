import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Users, Music, Disc, Search } from 'lucide-react';
import ModerationCard from '@/components/shared/ModerationCard';
import DetailsModal from '@/components/shared/DetailsModal';
import { mockArtistApplications, mockPendingAlbums, mockPendingTracks } from '@/mocks/moderationData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'pending', label: 'На проверке' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
];

export default function Moderation() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [artistApplications, setArtistApplications] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artistStatusFilter, setArtistStatusFilter] = useState('all');
  const [trackStatusFilter, setTrackStatusFilter] = useState('all');
  const [albumStatusFilter, setAlbumStatusFilter] = useState('all');
  const [artistSearch, setArtistSearch] = useState('');
  const [trackSearch, setTrackSearch] = useState('');
  const [albumSearch, setAlbumSearch] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-zinc-900/80 border-zinc-700' : 'bg-white/80 border-gray-200';
  const inputClass = isDark
    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
    : 'bg-white border-gray-300 text-gray-900';

  const loadData = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setArtistApplications(mockArtistApplications.map((a) => ({ ...a })));
      setTracks(mockPendingTracks.map((t) => ({ ...t, status: t.status || 'pending' })));
      setAlbums(mockPendingAlbums.map((a) => ({ ...a })));
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterByStatus = (list, statusFilter) => {
    if (statusFilter === 'all') return list;
    return list.filter((item) => item.status === statusFilter);
  };

  const filterBySearch = (list, search, titleKey = 'title', subtitleKey = 'artistName') => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (item) =>
        (item[titleKey] || '').toLowerCase().includes(q) ||
        (item[subtitleKey] || '').toLowerCase().includes(q)
    );
  };

  const filteredArtists = filterBySearch(
    filterByStatus(artistApplications, artistStatusFilter),
    artistSearch,
    'artistName',
    'fullName'
  );
  const filteredTracks = filterBySearch(
    filterByStatus(tracks, trackStatusFilter),
    trackSearch,
    'title',
    'artist_name'
  );
  const filteredAlbums = filterBySearch(
    filterByStatus(albums, albumStatusFilter),
    albumSearch,
    'albumTitle',
    'artistName'
  );

  const handleApproveArtist = (id) => {
    setArtistApplications((prev) => prev.filter((a) => a.id !== id));
    setSelectedArtist(null);
    toast.success('Заявка артиста одобрена');
  };

  const handleRejectArtist = (id, comment) => {
    setArtistApplications((prev) => prev.filter((a) => a.id !== id));
    setSelectedArtist(null);
    toast.success(comment ? 'Заявка отклонена' : 'Заявка отклонена');
  };

  const handleApproveTrack = (id) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTrack(null);
    toast.success('Трек одобрен');
  };

  const handleRejectTrack = (id, reason) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTrack(null);
    toast.success('Трек отклонён');
  };

  const handleApproveAlbum = (id) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setSelectedAlbum(null);
    toast.success('Альбом одобрен');
  };

  const handleRejectAlbum = (id) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setSelectedAlbum(null);
    toast.success('Альбом отклонён');
  };

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Card className={cn('max-w-md', cardBg)}>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-zinc-500 mb-4" />
            <h2 className={cn('text-xl font-semibold mb-2', textClass)}>Необходима авторизация</h2>
            <p className={textSecondary}>Войдите как администратор</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Card className={cn('max-w-md', cardBg)}>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-zinc-500 mb-4" />
            <h2 className={cn('text-xl font-semibold mb-2', textClass)}>Доступ запрещён</h2>
            <p className={textSecondary}>Эта страница доступна только модераторам</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className={cn('text-2xl sm:text-3xl font-bold flex items-center gap-3', textClass)}>
              <Shield className="w-8 h-8" />
              Модерация
            </h1>
            <p className={cn('mt-1', textSecondary)}>Заявки артистов, треки и альбомы</p>
          </div>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 text-sm px-3 py-1 w-fit">
            {artistApplications.filter((a) => a.status === 'pending').length +
              tracks.filter((t) => t.status === 'pending').length +
              albums.filter((a) => a.status === 'pending').length}{' '}
            на проверке
          </Badge>
        </div>

        <Tabs defaultValue="artists" className="w-full">
          <TabsList
            className={cn(
              'grid w-full grid-cols-3 mb-4 overflow-x-auto',
              isDark ? 'bg-zinc-800' : 'bg-gray-100'
            )}
          >
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Заявки артистов
            </TabsTrigger>
            <TabsTrigger value="tracks" className="flex items-center gap-2">
              <Music className="h-4 w-4" /> Треки
            </TabsTrigger>
            <TabsTrigger value="albums" className="flex items-center gap-2">
              <Disc className="h-4 w-4" /> Альбомы
            </TabsTrigger>
          </TabsList>

          {/* Вкладка: Заявки артистов */}
          <TabsContent value="artists" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={artistStatusFilter} onValueChange={setArtistStatusFilter}>
                <SelectTrigger className={cn('w-full sm:w-[180px]', inputClass)}>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Поиск по имени..."
                  value={artistSearch}
                  onChange={(e) => setArtistSearch(e.target.value)}
                  className={cn('pl-9', inputClass)}
                />
              </div>
            </div>
            {loading ? (
              <p className={textSecondary}>Загрузка...</p>
            ) : filteredArtists.length === 0 ? (
              <Card className={cardBg}>
                <CardContent className="p-8 text-center">
                  <p className={textSecondary}>Нет заявок по выбранным фильтрам</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredArtists.map((app) => (
                  <ModerationCard
                    key={app.id}
                    variant="artist"
                    item={{
                      artistName: app.artistName,
                      name: app.artistName,
                      date: app.date,
                      status: app.status,
                      bio: app.bio,
                    }}
                    onClick={() => setSelectedArtist(app)}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Вкладка: Треки */}
          <TabsContent value="tracks" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={trackStatusFilter} onValueChange={setTrackStatusFilter}>
                <SelectTrigger className={cn('w-full sm:w-[180px]', inputClass)}>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Поиск по названию или исполнителю..."
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  className={cn('pl-9', inputClass)}
                />
              </div>
            </div>
            {loading ? (
              <p className={textSecondary}>Загрузка...</p>
            ) : filteredTracks.length === 0 ? (
              <Card className={cardBg}>
                <CardContent className="p-8 text-center">
                  <p className={textSecondary}>Нет треков по выбранным фильтрам</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTracks.map((track) => (
                  <ModerationCard
                    key={track.id}
                    variant="track"
                    item={{
                      title: track.title,
                      artistName: track.artist_name,
                      date: track.created_date,
                      status: track.status,
                    }}
                    onClick={() => setSelectedTrack(track)}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Вкладка: Альбомы */}
          <TabsContent value="albums" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={albumStatusFilter} onValueChange={setAlbumStatusFilter}>
                <SelectTrigger className={cn('w-full sm:w-[180px]', inputClass)}>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Поиск по названию или исполнителю..."
                  value={albumSearch}
                  onChange={(e) => setAlbumSearch(e.target.value)}
                  className={cn('pl-9', inputClass)}
                />
              </div>
            </div>
            {loading ? (
              <p className={textSecondary}>Загрузка...</p>
            ) : filteredAlbums.length === 0 ? (
              <Card className={cardBg}>
                <CardContent className="p-8 text-center">
                  <p className={textSecondary}>Нет альбомов по выбранным фильтрам</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredAlbums.map((album) => (
                  <ModerationCard
                    key={album.id}
                    variant="album"
                    item={{
                      albumTitle: album.albumTitle,
                      title: album.albumTitle,
                      artistName: album.artistName,
                      date: album.date,
                      status: album.status,
                    }}
                    onClick={() => setSelectedAlbum(album)}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Модалка деталей заявки артиста */}
      <DetailsModal
        open={!!selectedArtist}
        onOpenChange={(open) => !open && setSelectedArtist(null)}
        title={selectedArtist ? `Заявка: ${selectedArtist.artistName}` : ''}
        onApprove={selectedArtist ? () => handleApproveArtist(selectedArtist.id) : undefined}
        onReject={selectedArtist ? (comment) => handleRejectArtist(selectedArtist.id, comment) : undefined}
        showRejectComment
        isDark={isDark}
      >
        {selectedArtist && (
          <>
            <DetailRow label="Имя артиста" value={selectedArtist.artistName} isDark={isDark} />
            <DetailRow label="Полное имя" value={selectedArtist.fullName} isDark={isDark} />
            <DetailRow label="Страна / Город" value={`${selectedArtist.country} / ${selectedArtist.city}`} isDark={isDark} />
            <DetailRow label="Телефон" value={selectedArtist.phone} isDark={isDark} />
            <DetailRow label="Telegram" value={selectedArtist.telegram} isDark={isDark} />
            <DetailRow label="VK" value={selectedArtist.vk} isDark={isDark} />
            <DetailRow label="YouTube" value={selectedArtist.youtube} isDark={isDark} />
            <DetailRow label="Биография" value={selectedArtist.bio} isDark={isDark} />
            <div>
              <p className={cn('text-sm font-medium mb-1', isDark ? 'text-zinc-300' : 'text-gray-700')}>Документы</p>
              <div className="flex flex-wrap gap-2">
                {(selectedArtist.documents || []).map((doc, i) => (
                  <a
                    key={i}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className={cn(
                      'text-sm underline flex items-center gap-1',
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    )}
                  >
                    {doc.name} ({(doc.size / 1024).toFixed(0)} КБ)
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </DetailsModal>

      {/* Модалка деталей трека */}
      <DetailsModal
        open={!!selectedTrack}
        onOpenChange={(open) => !open && setSelectedTrack(null)}
        title={selectedTrack ? `Трек: ${selectedTrack.title}` : ''}
        onApprove={selectedTrack ? () => handleApproveTrack(selectedTrack.id) : undefined}
        onReject={selectedTrack ? (reason) => handleRejectTrack(selectedTrack.id, reason) : undefined}
        showRejectComment
        isDark={isDark}
      >
        {selectedTrack && (
          <>
            <DetailRow label="Название" value={selectedTrack.title} isDark={isDark} />
            <DetailRow label="Исполнитель" value={selectedTrack.artist_name} isDark={isDark} />
            <DetailRow label="Жанр" value={selectedTrack.genre} isDark={isDark} />
            <DetailRow label="Описание" value={selectedTrack.description} isDark={isDark} />
            {selectedTrack.audio_url && (
              <div>
                <p className={cn('text-xs font-medium mb-1', isDark ? 'text-zinc-400' : 'text-gray-600')}>Аудио</p>
                <audio controls className="w-full mt-1" src={selectedTrack.audio_url}>
                  Ваш браузер не поддерживает аудио.
                </audio>
              </div>
            )}
          </>
        )}
      </DetailsModal>

      {/* Модалка деталей альбома */}
      <DetailsModal
        open={!!selectedAlbum}
        onOpenChange={(open) => !open && setSelectedAlbum(null)}
        title={selectedAlbum ? `Альбом: ${selectedAlbum.albumTitle}` : ''}
        onApprove={selectedAlbum ? () => handleApproveAlbum(selectedAlbum.id) : undefined}
        onReject={selectedAlbum ? () => handleRejectAlbum(selectedAlbum.id) : undefined}
        isDark={isDark}
      >
        {selectedAlbum && (
          <>
            <DetailRow label="Название" value={selectedAlbum.albumTitle} isDark={isDark} />
            <DetailRow label="Исполнитель" value={selectedAlbum.artistName} isDark={isDark} />
            <DetailRow
              label="Дата загрузки"
              value={selectedAlbum.date ? new Date(selectedAlbum.date).toLocaleDateString('ru-RU') : '—'}
              isDark={isDark}
            />
          </>
        )}
      </DetailsModal>
    </div>
  );
}

function DetailRow({ label, value, isDark }) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-zinc-400' : 'text-gray-600';
  if (!value) return null;
  return (
    <div>
      <p className={cn('text-xs font-medium', textMuted)}>{label}</p>
      <p className={cn('text-sm', textClass)}>{value}</p>
    </div>
  );
}
