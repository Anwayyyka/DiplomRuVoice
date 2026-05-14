const API_BASE = '/api';

async function readApiError(res, fallbackMessage) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null);
    if (data && typeof data === 'object') {
      return data.message || data.error || fallbackMessage;
    }
    return fallbackMessage;
  }

  const text = (await res.text().catch(() => '')).trim();
  return text || fallbackMessage;
}

export const authAPI = {
  register: async (email, password, fullName) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка регистрации'));
    }

    return res.json();
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка входа'));
    }

    return res.json();
  },

  getProfile: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, 'Ошибка получения профиля'));
    }

    return res.json();
  },
};