const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const favoritesAPI = {
  // Получить избранные треки пользователя (возвращает массив лайков или треков? В бэкенде возвращает favorites)
  // В нашем бэкенде эндпоинт GET /api/favorites возвращает массив favorites (связки user_id, track_id)
  // Но фронтенду нужны треки. Нужно либо запросить треки по id из favorites, либо сделать эндпоинт, возвращающий треки.
  // Пока будем возвращать массив favorites, а в компонентах будем доставать track_id и получать треки отдельно.
  // Однако в Home.jsx используется favoritesAPI.getUserFavorites(user.id) и затем isFavorite проверяет по track_id.
  // Значит, нам нужны именно favorites (объекты с полем track_id).
  // В бэкенде такой эндпоинт есть: GET /api/favorites (возвращает список избранного для текущего пользователя).
  getUserFavorites: async (userId) => {
    // userId можно не использовать, так как бэкенд определит пользователя по токену
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка загрузки избранного');
    return res.json();
  },

  addFavorite: async (userId, trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/favorite`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка добавления в избранное');
    return res.json();
  },

  removeFavorite: async (userId, trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/favorite`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Ошибка удаления из избранного');
    return res.json();
  },
};