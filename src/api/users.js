import { normalizeArtistRequestPayload } from '@/lib/artistRequestStatus';

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

  // Обновить профиль (JSON)
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

  // Обновить профиль с загрузкой аватара и/или шапки (multipart/form-data)
  updateProfileWithFiles: async (userId, formData) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error('Ошибка обновления профиля');
    return res.json();
  },

  // Получить текущую заявку пользователя на статус артиста
  getMyArtistRequest: async () => {
    const res = await fetch(`${API_BASE}/users/me/artist-request`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 404 || res.status === 204) return null;
    // Нет/неверный токен — не считаем это «ошибкой заявки», чтобы фронт мог показать форму и понятную ошибку при POST
    if (res.status === 401 || res.status === 403) return null;
    if (!res.ok) throw new Error('Ошибка получения заявки');
    const body = await res.json().catch(() => null);
    if (body == null) return null;
    if (Array.isArray(body) && body.length > 0) {
      return normalizeArtistRequestPayload(body[0]) || body[0];
    }
    return normalizeArtistRequestPayload(body) || body;
  },

  // Отправить заявку на статус артиста (одна активная заявка; повтор — 409)
  submitArtistRequest: async (data) => {
    const res = await fetch(`${API_BASE}/users/me/artist-request`, {
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
      let errorMessage = 'Ошибка отправки заявки';
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json().catch(() => ({}));
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        errorMessage = (await res.text()) || errorMessage;
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          /unauthor/i.test(errorMessage)
            ? 'Сессия недействительна. Выйдите из аккаунта и войдите снова.'
            : 'Требуется авторизация. Проверьте, что вы вошли в аккаунт.'
        );
      }
      const duplicate =
        res.status === 409 ||
        /уже\s+отправ|already\s+exist|duplicate|заявк.*существ|conflict/i.test(errorMessage);
      if (duplicate) {
        throw new Error(
          errorMessage && /уже|exist|duplicate|заявк|conflict/i.test(errorMessage)
            ? errorMessage
            : 'Вы уже отправили заявку на модерацию. Дождитесь решения модератора.'
        );
      }
      throw new Error(errorMessage);
    }
    const body = await res.json().catch(() => ({}));
    return normalizeArtistRequestPayload(body) || body;
  },

  // Устаревший метод, оставлен для совместимости
  requestArtist: async (_userId, data) => {
    return usersAPI.submitArtistRequest(data);
  },
};