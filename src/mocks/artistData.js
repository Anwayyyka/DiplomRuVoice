// Моковые пользователи
export const mockUsers = [
  {
    email: 'artist@example.com',
    full_name: 'Иван Петров',
    avatar_url: 'https://i.pravatar.cc/300?u=artist',
    banner_url: 'https://picsum.photos/1200/400?random=1',
    bio: 'Музыкант, композитор, автор песен. Играю инди-рок и электронику.',
    telegram: 'https://t.me/artist',
    vk: 'https://vk.com/artist',
    youtube: 'https://youtube.com/@artist',
    website: 'https://artist.com',
  },
  {
    email: 'user@example.com',
    full_name: 'Анна Смирнова',
    avatar_url: 'https://i.pravatar.cc/300?u=user',
  },
];

// Моковые треки
export const mockTracks = [
  {
    id: '1',
    title: 'Летний дождь',
    artist_name: 'Иван Петров',
    created_by: 'artist@example.com',
    cover_url: 'https://picsum.photos/200/200?random=1',
    audio_url: 'https://example.com/track1.mp3',
    duration: 210,
    plays_count: 1245,
    likes_count: 89,
    genre: 'pop',
    status: 'approved',
    created_date: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Ночной город',
    artist_name: 'Иван Петров',
    created_by: 'artist@example.com',
    cover_url: 'https://picsum.photos/200/200?random=2',
    audio_url: 'https://example.com/track2.mp3',
    duration: 185,
    plays_count: 978,
    likes_count: 56,
    genre: 'electronic',
    status: 'approved',
    created_date: '2024-02-20T12:30:00Z',
  },
  {
    id: '3',
    title: 'Без слов',
    artist_name: 'Иван Петров',
    created_by: 'artist@example.com',
    cover_url: 'https://picsum.photos/200/200?random=3',
    audio_url: 'https://example.com/track3.mp3',
    duration: 240,
    plays_count: 2034,
    likes_count: 145,
    genre: 'indie',
    status: 'approved',
    created_date: '2024-03-05T09:15:00Z',
  },
];

// Моковое избранное
export const mockFavorites = [
  { track_id: '1', user_email: 'user@example.com' },
];