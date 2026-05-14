const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const usersAPI = {
  // Получить пользователя по ID
  getUserById: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка получения пользователя');
    return res.json();
  },

  // Получить пользователя по email
  getUserByEmail: async (email) => {
    const res = await fetch(`${API_BASE}/users/by-email/${email}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка получения пользователя');
    return res.json();
  },

  // Обновить профиль
  updateProfile: async (userId, data) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Ошибка обновления профиля');
    return res.json();
  },

  // Запрос на становление артистом
  requestArtist: async (userId, data) => {
    const res = await fetch(`${API_BASE}/profile/artist-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        artist_name: data.artist_name,
        bio: data.bio,
      }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Ошибка запроса');
    }
    return res.json();
  },
};