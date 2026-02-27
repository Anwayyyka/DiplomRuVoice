const API_BASE = '/api';

export const authAPI = {
  register: async (email, password, fullName) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        password, 
        full_name: fullName 
      }),
    });
    if (!res.ok) {
      let errorMessage = 'Ошибка регистрации';
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json().catch(() => ({}));
        errorMessage = errorData.message || errorMessage;
      } else {
        errorMessage = await res.text() || errorMessage;
      }
      throw new Error(errorMessage);
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
      let errorMessage = 'Ошибка входа';
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json().catch(() => ({}));
        errorMessage = errorData.message || errorMessage;
      } else {
        errorMessage = await res.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  },
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      let errorMessage = 'Ошибка получения профиля';
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json().catch(() => ({}));
        errorMessage = errorData.message || errorMessage;
      } else {
        errorMessage = await res.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  },
};