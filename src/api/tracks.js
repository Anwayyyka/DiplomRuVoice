// Здесь будут функции для работы с вашим бэкендом
// Замените URL и логику на реальные эндпоинты

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function uploadFile(file, type) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type); // 'audio' или 'image'

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
    // если нужна авторизация, добавьте headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка загрузки файла');
  }

  const data = await response.json();
  return { url: data.url }; // ожидаем, что сервер вернёт { url: '...' }
}

export async function createTrack(trackData) {
  const response = await fetch(`${API_BASE}/tracks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(trackData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка создания трека');
  }

  return response.json();
}