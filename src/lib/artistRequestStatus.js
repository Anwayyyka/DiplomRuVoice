/**
 * Нормализация ответа бэкенда о заявке на статус артиста
 * (объект может быть в корне, в .request или в .data).
 */
export function normalizeArtistRequestPayload(body) {
  if (body == null || typeof body !== 'object') return null;
  if (body.request && typeof body.request === 'object') return body.request;
  if (body.data != null && typeof body.data === 'object') return body.data;
  if (body.id != null || body.status != null) return body;
  return null;
}

/** Заявка считается ожидающей модерацию (нельзя слать вторую). */
export function isPendingArtistRequest(req) {
  const r = normalizeArtistRequestPayload(req) || req;
  if (!r || typeof r !== 'object') return false;
  const s = String(r.status || '').toLowerCase();
  return ['pending', 'submitted', 'under_review', 'new', 'on_review'].includes(s);
}
