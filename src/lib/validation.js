/**
 * Общие проверки полей для форм (toast-friendly сообщения на русском).
 */

const IMAGE_TYPES = /^image\/(jpeg|png|webp|gif)$/i;
const AUDIO_TYPES = /^audio\//i;
const DOC_TYPES = /^(application\/pdf|image\/(jpeg|png))$/i;

/** Убирает пробелы, скобки, дефисы в телефоне для подсчёта длины/цифр */
export function normalizePhoneRu(value) {
  return String(value || '').replace(/[\s().-]/g, '');
}

/**
 * Телефон РФ: с «+» — ровно 12 символов (+7 и 10 цифр); без «+» — 11 цифр, начало 7 или 8.
 */
export function validatePhoneRu(value, label = 'Телефон') {
  const t = normalizePhoneRu(value).trim();
  if (!t) return `${label}: укажите номер телефона`;
  if (t.startsWith('+')) {
    if (t.length !== 12) {
      return `${label}: при коде с «+» введите 12 символов (например, +79161234567)`;
    }
    if (!/^\+7\d{10}$/.test(t)) {
      return `${label}: после «+7» должно быть 10 цифр номера`;
    }
  } else {
    if (!/^\d+$/.test(t)) return `${label}: без «+» допускаются только цифры (11 знаков)`;
    if (t.length !== 11) {
      return `${label}: без знака «+» номер должен содержать ровно 11 цифр`;
    }
    if (!/^[78]\d{10}$/.test(t)) {
      return `${label}: номер без «+» должен начинаться с 7 или 8`;
    }
  }
  return null;
}

/** Имя / ФИО: только буквы (латиница и кириллица), пробел, дефис, точка, апостроф; без цифр */
export function validatePersonName(value, label = 'Имя') {
  const s = String(value || '').trim();
  if (!s) return `${label}: укажите значение`;
  if (/\d/.test(s)) return `${label}: не используйте цифры`;
  if (s.length < 2) return `${label}: слишком короткое значение`;
  if (s.length > 120) return `${label}: слишком длинное значение (макс. 120 символов)`;
  if (!/^[a-zA-Zа-яА-ЯёЁ\s\-'.]+$/u.test(s)) {
    return `${label}: допускаются только буквы, пробел, дефис, точка и апостроф`;
  }
  return null;
}

/** Необязательное ФИО: если пусто — ок, иначе как validatePersonName */
export function validateOptionalPersonName(value, label = 'Полное имя') {
  const s = String(value || '').trim();
  if (!s) return null;
  return validatePersonName(s, label);
}

/** Сценическое имя / псевдоним: буквы, цифры, пробел и распространённые знаки */
export function validateStageName(value, label = 'Имя артиста') {
  const s = String(value || '').trim();
  if (!s) return `${label}: укажите значение`;
  if (s.length < 2) return `${label}: минимум 2 символа`;
  if (s.length > 80) return `${label}: максимум 80 символов`;
  if (!/^[\w\s\-'"«».,!?&а-яА-ЯёЁa-zA-Z]+$/u.test(s)) {
    return `${label}: используйте буквы, цифры и обычные знаки препинания`;
  }
  return null;
}

export function validateRequired(value, label) {
  const s = String(value ?? '').trim();
  if (!s) return `${label}: это обязательное поле`;
  return null;
}

export function validateEmail(value, label = 'Email') {
  const s = String(value || '').trim();
  if (!s) return `${label}: укажите email`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return `${label}: некорректный формат email`;
  return null;
}

export function validatePassword(value, minLen = 8, label = 'Пароль') {
  const s = String(value || '');
  if (!s) return `${label}: укажите пароль`;
  if (s.length < minLen) return `${label}: минимум ${minLen} символов`;
  return null;
}

/** Необязательная HTTP(S) ссылка */
export function validateOptionalHttpUrl(value, label) {
  const s = String(value || '').trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return `${label}: ссылка должна начинаться с http:// или https://`;
    }
  } catch {
    return `${label}: укажите корректную ссылку (например, https://...)`;
  }
  return null;
}

export function validateImageFile(file, maxBytes = 10 * 1024 * 1024, label = 'Изображение') {
  if (!file) return `${label}: выберите файл`;
  if (!IMAGE_TYPES.test(file.type)) {
    return `${label}: допустимы только изображения (JPEG, PNG, WebP, GIF)`;
  }
  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    return `${label}: файл слишком большой (макс. ${mb} МБ)`;
  }
  return null;
}

export function validateAudioFile(file, maxBytes = 80 * 1024 * 1024, label = 'Аудио') {
  if (!file) return `${label}: выберите аудиофайл`;
  if (!AUDIO_TYPES.test(file.type)) {
    return `${label}: выберите файл формата аудио`;
  }
  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    return `${label}: файл слишком большой (макс. ${mb} МБ)`;
  }
  return null;
}

export function validateDocumentFile(file, maxBytes = 15 * 1024 * 1024, label = 'Документ') {
  if (!file) return `${label}: выберите файл`;
  if (!DOC_TYPES.test(file.type)) {
    return `${label}: допустимы только PDF, JPEG или PNG`;
  }
  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    return `${label}: файл слишком большой (макс. ${mb} МБ)`;
  }
  return null;
}

export function validateMinLength(value, min, label) {
  const s = String(value || '').trim();
  if (s.length < min) return `${label}: минимум ${min} символов`;
  return null;
}

export function validateMaxLength(value, max, label) {
  const s = String(value || '');
  if (s.length > max) return `${label}: максимум ${max} символов`;
  return null;
}

/** Первая непустая строка ошибки из списка результатов проверок */
export function firstError(...checks) {
  for (const err of checks) {
    if (typeof err === 'string' && err) return err;
  }
  return null;
}
