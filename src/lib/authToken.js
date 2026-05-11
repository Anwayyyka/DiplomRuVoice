/** Достаёт JWT из типичных ответов Go/JSON API (разные имена полей). */
export function readAuthTokenFromResponse(data) {
  if (!data || typeof data !== 'object') return null;
  const t = data.token ?? data.access_token ?? data.accessToken ?? data.Token;
  return typeof t === 'string' && t.trim().length > 0 ? t.trim() : null;
}
