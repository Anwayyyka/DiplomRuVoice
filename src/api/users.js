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

export const usersAPI = {
  getUserById: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка получения пользователя'));
    }

    return res.json();
  },

  getUserByEmail: async (email) => {
    const res = await fetch(`${API_BASE}/users/by-email/${encodeURIComponent(email)}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка получения пользователя'));
    }

    return res.json();
  },

  updateProfile: async (_userId, data) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка обновления профиля'));
    }

    return res.json();
  },

  updateProfileWithFiles: async (_userId, formData) => {
    const payload = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        payload[key] = value;
      }
    }

    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка обновления профиля'));
    }

    return res.json();
  },

  getMyArtistRequest: async () => {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка получения профиля'));
    }

    const profile = await res.json();

    return {
      artist_name: profile.artist_name || null,
      bio: profile.bio || null,
      status: profile.artist_requested ? 'pending' : null,
      user_id: profile.id,
    };
  },

  submitArtistRequest: async (data) => {
    const authH = getAuthHeaders();
    const res = await fetch(`${API_BASE}/profile/artist-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authH,
      },
      body: JSON.stringify({
        artist_name: data.artist_name,
        bio: data.bio,
      }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка отправки заявки'));
    }

    return res.json();
  },

  requestArtist: async (_userId, data) => {
    return usersAPI.submitArtistRequest(data);
  },
};