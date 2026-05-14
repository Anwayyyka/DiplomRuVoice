import { normalizeTrackMedia } from '@/lib/mediaUrl';

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

/** Ответ /api/jamendo/tracks: массив с бэка или обёртка Jamendo `{ results: [...] }`. */
function coalesceJamendoCatalogResponse(data) {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.tracks)) return data.tracks;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
}

/** Строка каталога: уже формат приложения или сырое тело Jamendo (`name`, `audio`, `image`). */
function catalogRowToAppTrack(row) {
  if (!row || typeof row !== 'object') return null;
  if (row.title != null) {
    return normalizeTrackMedia(row);
  }
  if (row.name != null) {
    return normalizeTrackMedia({
      id: row.id,
      title: row.name,
      artist_name: row.artist_name ?? '—',
      audio_url: row.audio ?? row.audio_url,
      cover_url: row.image ?? row.cover_url,
      duration: row.duration ?? 0,
      plays_count: row.plays_count ?? 0,
      likes_count: row.likes_count ?? 0,
      status: row.status ?? 'approved',
      is_external: row.is_external !== undefined ? row.is_external : true,
      external_id: row.external_id ?? row.id,
      external_source: row.external_source ?? 'jamendo',
    });
  }
  return normalizeTrackMedia(row);
}

export const tracksAPI = {
  /**
   * Каталог: прокси Jamendo или сохранённые в БД треки — всегда нормализуем в массив объектов с `id`, `title`, `audio_url`…
   * @param {{ limit?: number } | number} [options]
   */
  getApprovedTracks: async (options = {}) => {
    const limit = typeof options === 'number' ? options : (options?.limit ?? 100);
    const res = await fetch(
      `${API_BASE}/jamendo/tracks?limit=${encodeURIComponent(String(limit))}`
    );
    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка загрузки треков'));
    }
    const data = await res.json();
    const rows = coalesceJamendoCatalogResponse(data);
    return rows.map(catalogRowToAppTrack).filter(Boolean);
  },

  getArtistTracks: async (artistId) => {
    const res = await fetch(`${API_BASE}/artists/${artistId}/tracks`);
    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка загрузки треков артиста'));
    }
    const data = await res.json();
    if (Array.isArray(data)) return data.map(normalizeTrackMedia);
    if (data && typeof data === 'object') return normalizeTrackMedia(data);
    return data;
  },

  getTrackById: async (trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}`);
    if (!res.ok) {
      throw new Error(await readApiError(res, 'Трек не найден'));
    }
    const data = await res.json();
    return normalizeTrackMedia(data);
  },

  playTrack: async (trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/play`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка обновления счётчика'));
    }

    return { success: true };
  },

  likeTrack: async (_userId, trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка при лайке'));
    }

    return { success: true };
  },

  unlikeTrack: async (_userId, trackId) => {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка при удалении лайка'));
    }

    return { success: true };
  },

  uploadTrack: async (formData) => {
    const res = await fetch(`${API_BASE}/tracks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка загрузки трека'));
    }

    const data = await res.json();
    return normalizeTrackMedia(data);
  },

  getPendingTracks: async () => {
    const res = await fetch(`${API_BASE}/moderation/pending`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка загрузки треков на модерацию'));
    }

    const data = await res.json();
    if (Array.isArray(data)) return data.map(normalizeTrackMedia);
    if (data && typeof data === 'object') return normalizeTrackMedia(data);
    return data;
  },

  approveTrack: async (trackId) => {
    const res = await fetch(`${API_BASE}/moderation/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ track_id: trackId }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка при одобрении'));
    }

    return { success: true };
  },

  rejectTrack: async (trackId, reason) => {
    const res = await fetch(`${API_BASE}/moderation/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ track_id: trackId, reason }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка при отклонении'));
    }

    return { success: true };
  },
};