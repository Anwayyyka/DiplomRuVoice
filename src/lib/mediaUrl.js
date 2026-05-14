/**
 * Приводит URL файла с бэкенда к пути, который открывается с того же origin, что и Vite (через proxy).
 * Поддерживаются полные URL на localhost:8080, относительные пути и альтернативные имена полей в JSON.
 */

export function resolveMediaUrl(url) {
  if (url == null || url === '') return null;
  const s = String(url).trim();
  if (!s) return null;

  if (s.startsWith('//')) {
    return typeof window !== 'undefined' ? `${window.location.protocol}${s}` : `https:${s}`;
  }

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
    const isLoopback = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
      if (
        isLoopback &&
        (u.port === '8080' || u.pathname.startsWith('/uploads') || u.pathname.startsWith('/static'))
      ) {
        return `${u.pathname}${u.search}`;
      }
      return s;
    } catch {
      return s;
    }
  }

  if (s.startsWith('/')) return s;
  return `/${s}`;
}

function pickRawAudio(track) {
  if (!track || typeof track !== 'object') return null;
  return (
    track.audio_url ??
    track.audioUrl ??
    track.audio_path ??
    track.audioPath ??
    track.audio_file ??
    track.audioFile ??
    track.file_url ??
    track.fileUrl ??
    track.media_url ??
    track.mediaUrl ??
    track.upload_path ??
    track.uploadPath
  );
}

function pickRawCover(track) {
  if (!track || typeof track !== 'object') return null;
  return (
    track.cover_url ??
    track.coverUrl ??
    track.cover_path ??
    track.coverPath ??
    track.cover_file ??
    track.coverFile ??
    track.image_url ??
    track.imageUrl ??
    track.thumbnail_url ??
    track.thumbnailUrl
  );
}

/** Нормализует поля audio_url / cover_url для отображения и <audio>/<img>. */
export function normalizeTrackMedia(track) {
  if (!track || typeof track !== 'object') return track;
  const rawAudio = pickRawAudio(track);
  const rawCover = pickRawCover(track);
  const audio_url = rawAudio != null && String(rawAudio).trim() !== '' ? resolveMediaUrl(rawAudio) : null;
  const cover_url = rawCover != null && String(rawCover).trim() !== '' ? resolveMediaUrl(rawCover) : null;
  return {
    ...track,
    audio_url: audio_url ?? track.audio_url ?? null,
    cover_url: cover_url ?? track.cover_url ?? null,
  };
}

export function getTrackAudioUrl(track) {
  if (!track) return null;
  const n = normalizeTrackMedia(track);
  return n.audio_url || null;
}

export function getTrackCoverUrl(track) {
  if (!track) return null;
  const n = normalizeTrackMedia(track);
  return n.cover_url || null;
}
