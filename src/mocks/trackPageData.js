// Текущий пользователь
export const mockUser = {
  email: 'user@example.com',
  full_name: 'Анна Смирнова',
};

// Детальная информация о треке
export const mockTrack = {
  id: '1',
  title: 'Летний дождь',
  artist_name: 'Иван Петров',
  created_by: 'artist@example.com',
  cover_url: 'https://picsum.photos/400/400?random=1',
  audio_url: 'https://example.com/track1.mp3',
  duration: 210,
  plays_count: 1245,
  likes_count: 89,
  genre: 'pop',
  description: 'Атмосферная композиция о летнем дожде, записана в домашней студии в 2024 году.',
  created_date: '2024-01-15T10:00:00Z',
  status: 'approved',
};

// Комментарии к треку
export const mockComments = [
  {
    id: 'c1',
    track_id: '1',
    user_email: 'listener1@example.com',
    user_name: 'Алексей',
    text: 'Отличный трек! Очень понравилась мелодия.',
    created_date: '2024-01-16T14:23:00Z',
  },
  {
    id: 'c2',
    track_id: '1',
    user_email: 'listener2@example.com',
    user_name: 'Екатерина',
    text: 'Напоминает летний закат. Спасибо за творчество!',
    created_date: '2024-01-17T09:45:00Z',
  },
  {
    id: 'c3',
    track_id: '1',
    user_email: 'listener3@example.com',
    user_name: 'Дмитрий',
    text: 'Звук на высоте, жду новых релизов.',
    created_date: '2024-01-18T20:12:00Z',
  },
];

// Лайки трека (кто поставил)
export const mockLikes = [
  { id: 'l1', track_id: '1', user_email: 'user@example.com', created_date: '2024-01-15T12:00:00Z' },
  { id: 'l2', track_id: '1', user_email: 'listener2@example.com', created_date: '2024-01-15T13:20:00Z' },
  { id: 'l3', track_id: '1', user_email: 'listener4@example.com', created_date: '2024-01-16T08:15:00Z' },
];