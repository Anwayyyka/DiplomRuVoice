/** Следующий/предыдущий трек в плейлисте (циклически). delta: +1 или -1 */
export function advanceInPlaylist(playlist, currentTrack, delta) {
  if (!Array.isArray(playlist) || playlist.length < 2 || !currentTrack) return null;
  const cur = Number(currentTrack.id);
  const idx = playlist.findIndex(t => Number(t.id) === cur);
  if (idx === -1) return null;
  const nextIdx = (idx + delta + playlist.length) % playlist.length;
  return playlist[nextIdx];
}

/** Один и тот же трек по id (строка/число из Jamendo или БД). */
export function isSameTrack(a, b) {
  if (a == null || b == null) return false;
  return Number(a.id) === Number(b.id);
}
