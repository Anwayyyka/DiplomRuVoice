/**
 * Заглушки для формы загрузки трека: тональности, настроение, альбомы
 */
export const KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
];

export const MOODS = [
  { value: 'energetic', label: 'Энергичный' },
  { value: 'sad', label: 'Грустный' },
  { value: 'calm', label: 'Спокойный' },
  { value: 'romantic', label: 'Романтичный' },
  { value: 'aggressive', label: 'Агрессивный' },
  { value: 'happy', label: 'Весёлый' },
  { value: 'dark', label: 'Тёмный' },
  { value: 'other', label: 'Другое' },
];

export const RELEASE_TYPES = [
  { value: 'single', label: 'Сингл' },
  { value: 'album', label: 'Альбом' },
  { value: 'ep', label: 'EP' },
];

export const LANGUAGES = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'Английский' },
  { value: 'other', label: 'Другой' },
];

/** Мок списка альбомов артиста */
export const MOCK_ALBUMS = [
  { value: '1', label: 'Первый альбом' },
  { value: '2', label: 'Второй альбом' },
  { value: 'new', label: '+ Создать новый альбом' },
];
