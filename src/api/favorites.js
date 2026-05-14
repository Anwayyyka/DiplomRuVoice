const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function readApiError(res, fallbackMessage) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null);
    if (data && typeof data === 'object') {
      return data.message || data.error || fallbackMessage;
    }
  } else {
    const text = (await res.text().catch(() => '')).trim();
    if (text) return text;
  }
  return fallbackMessage;
}

/** Извлекает id трека из элемента ответа API (разные бэкенды дают разные поля). */
function normalizeFavoriteRow(item) {
  if (item == null) return null;
  if (typeof item === 'number' && Number.isFinite(item)) {
    return { track_id: item };
  }
  if (typeof item === 'string' && item !== '') {
    const n = Number(item);
    return Number.isFinite(n) ? { track_id: n } : null;
  }
  if (typeof item !== 'object') return null;
  const fromNested = item.track && item.track.id != null ? Number(item.track.id) : NaN;
  const tid =
    item.track_id ??
    item.trackId ??
    (Number.isFinite(fromNested) ? fromNested : undefined) ??
    (item.id != null && (item.title != null || item.artist_name != null) ? Number(item.id) : undefined);
  if (tid == null || tid === '') return null;
  const n = Number(tid);
  return Number.isFinite(n) ? { track_id: n } : null;
}

/** Приводит тело ответа GET /favorites к массиву { track_id }. */
export function normalizeFavoritesPayload(data) {
  if (data == null) return [];
  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (typeof data === 'object') {
    if (Array.isArray(data.favorites)) list = data.favorites;
    else if (Array.isArray(data.items)) list = data.items;
    else if (Array.isArray(data.data)) list = data.data;
    else if (Array.isArray(data.tracks)) list = data.tracks;
  }
  const out = [];
  for (const item of list) {
    const row = normalizeFavoriteRow(item);
    if (row) out.push(row);
  }
  return out;
}

export const favoritesAPI = {
  getUserFavorites: async () => {
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка загрузки избранного'));
    }

    const raw = await res.json();
    return normalizeFavoritesPayload(raw);
  },

  addFavorite: async (_userId, trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/favorite`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка добавления в избранное'));
    }

    return { success: true };
  },

  removeFavorite: async (_userId, trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/favorite`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка удаления из избранного'));
    }

    return { success: true };
  },
};