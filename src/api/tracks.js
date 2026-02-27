const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const tracksAPI = {
  // Получить все одобренные треки (главная, чарты, поиск)
  getApprovedTracks: async () => {
    const res = await fetch(`${API_BASE}/tracks`);
    if (!res.ok) throw new Error('Ошибка загрузки треков');
    return res.json();
  },

  // Получить треки артиста по его ID (правильный эндпоинт)
  getArtistTracks: async (artistId) => {
    const res = await fetch(`${API_BASE}/artists/${artistId}/tracks`);
    if (!res.ok) throw new Error('Ошибка загрузки треков артиста');
    return res.json();
  },

  // Получить трек по ID
  getTrackById: async (trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}`);
    if (!res.ok) throw new Error('Трек не найден');
    return res.json();
  },

  // Увеличить счётчик прослушиваний
  playTrack: async (trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/play`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка обновления счётчика');
    return res.json();
  },

  // Лайк трека
  likeTrack: async (userId, trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка при лайке');
    return res.json();
  },

  // Дизлайк
  unlikeTrack: async (userId, trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка при удалении лайка');
    return res.json();
  },

  // Загрузить трек (для артистов)
  uploadTrack: async (formData) => {
    const res = await fetch(`${API_BASE}/tracks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error('Ошибка загрузки трека');
    return res.json();
  },

  // Получить треки на модерации (админ)
  getPendingTracks: async () => {
    const res = await fetch(`${API_BASE}/moderation/pending`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка загрузки треков на модерацию');
    return res.json();
  },

  // Одобрить трек
  approveTrack: async (trackId) => {
    const res = await fetch(`${API_BASE}/moderation/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ track_id: trackId }),
    });
    if (!res.ok) throw new Error('Ошибка при одобрении');
    return res.json();
  },

  // Отклонить трек с причиной
  rejectTrack: async (trackId, reason) => {
    const res = await fetch(`${API_BASE}/moderation/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ track_id: trackId, reason }),
    });
    if (!res.ok) throw new Error('Ошибка при отклонении');
    return res.json();
  },
};