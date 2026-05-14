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

// Заявки на статус артиста (для вкладки модерации)
export const mockArtistApplications = [
  {
    id: 'a1',
    artistName: 'Мария Звездова',
    fullName: 'Мария Ивановна Звездова',
    country: 'RU',
    city: 'Москва',
    phone: '+7 999 123-45-67',
    date: '2025-02-28T10:00:00Z',
    status: 'pending',
    bio: 'Певица, автор песен. Выступаю с 2019 года. Участие в фестивалях «Нашествие», «Дикая мята».',
    telegram: 'https://t.me/maria_z',
    vk: 'https://vk.com/maria_z',
    youtube: 'https://youtube.com/@maria_z',
    documents: [{ name: 'passport.pdf', size: 245000 }, { name: 'contract.pdf', size: 120000 }],
  },
  {
    id: 'a2',
    artistName: 'Кирилл Бит',
    fullName: 'Кирилл Сергеевич Битков',
    country: 'RU',
    city: 'Санкт-Петербург',
    phone: '+7 912 555-00-11',
    date: '2025-02-27T15:30:00Z',
    status: 'pending',
    bio: 'Электронная музыка, продакшн. Работал с лейблами Soundcloud.',
    documents: [{ name: 'passport_scan.jpg', size: 890000 }],
  },
];

// Альбомы на модерации
export const mockPendingAlbums = [
  {
    id: 'al1',
    albumTitle: 'Первая весна',
    artistName: 'Мария Звездова',
    date: '2025-02-25T12:00:00Z',
    status: 'pending',
  },
  {
    id: 'al2',
    albumTitle: 'Neon Nights',
    artistName: 'DJ Pulse',
    date: '2025-02-24T09:00:00Z',
    status: 'pending',
  },
];