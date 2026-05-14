// Пользователь-администратор
export const mockAdminUser = {
  email: 'admin@example.com',
  full_name: 'Администратор',
  role: 'admin',
};

// Треки на модерации
export const mockPendingTracks = [
  {
    id: 'p1',
    title: 'Новый трек 1',
    artist_name: 'Иван Петров',
    created_by: 'artist1@example.com',
    cover_url: 'https://picsum.photos/200/200?random=101',
    audio_url: 'https://example.com/track_p1.mp3',
    duration: 215,
    genre: 'pop',
    description: 'Экспериментальный поп с элементами электроники',
    created_date: '2025-02-10T14:30:00Z',
    status: 'pending',
  },
  {
    id: 'p2',
    title: 'Рок-баллада',
    artist_name: 'Алексей Волков',
    created_by: 'artist3@example.com',
    cover_url: 'https://picsum.photos/200/200?random=102',
    audio_url: 'https://example.com/track_p2.mp3',
    duration: 280,
    genre: 'rock',
    description: 'Лирическая рок-композиция',
    created_date: '2025-02-09T09:20:00Z',
    status: 'pending',
  },
  {
    id: 'p3',
    title: 'Электронный сон',
    artist_name: 'DJ Pulse',
    created_by: 'artist5@example.com',
    cover_url: 'https://picsum.photos/200/200?random=103',
    audio_url: 'https://example.com/track_p3.mp3',
    duration: 195,
    genre: 'electronic',
    description: 'Атмосферная электронная музыка',
    created_date: '2025-02-08T18:45:00Z',
    status: 'pending',
  },
];