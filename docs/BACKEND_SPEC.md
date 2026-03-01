# Спецификация бэкенда (Go + PostgreSQL)

Описание API и структуры БД, которые нужно реализовать на сервере, чтобы фронтенд (страницы «Стать артистом», загрузка трека, модерация, «Мои заявки») работал с реальными данными.

---

## 1. Заявки на статус артиста (Become Artist)

### Таблица БД

```sql
CREATE TABLE artist_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Шаг 1: личные данные
  artist_name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  country VARCHAR(10),
  city VARCHAR(255),
  phone VARCHAR(50),
  -- Шаг 3: соцсети и био
  telegram VARCHAR(500),
  vk VARCHAR(500),
  youtube VARCHAR(500),
  website VARCHAR(500),
  bio TEXT,
  -- Соглашение
  agreement_accepted_at TIMESTAMPTZ,
  -- Статус и модерация
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft | pending | approved | rejected
  current_step INT DEFAULT 1,
  moderator_id UUID REFERENCES users(id),
  moderator_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE artist_application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES artist_applications(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  file_path VARCHAR(500) NOT NULL,  -- путь в хранилище (S3/локально)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/artist-applications/me` | Текущая заявка пользователя (или черновик). Ответ: объект заявки + массив `documents`. |
| POST | `/api/artist-applications` | Создать черновик или обновить шаг (тело: поля шага 1–4). |
| POST | `/api/artist-applications/:id/documents` | Загрузить документ (multipart: file). |
| DELETE | `/api/artist-applications/:id/documents/:docId` | Удалить документ. |
| POST | `/api/artist-applications/:id/submit` | Отправить на модерацию (status → pending). |

Пример тела создания/обновления заявки (по шагам):

```json
{
  "artist_name": "Псевдоним",
  "full_name": "Иван Иванов",
  "country": "RU",
  "city": "Москва",
  "phone": "+7 999 123-45-67",
  "telegram": "https://t.me/...",
  "vk": "https://vk.com/...",
  "youtube": "https://youtube.com/...",
  "website": "https://...",
  "bio": "Текст биографии до 500 символов",
  "agreement_accepted": true,
  "current_step": 4
}
```

---

## 2. Загрузка трека (расширенная форма)

### Таблица tracks (полная структура)

```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Основное
  title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  album_id UUID REFERENCES albums(id),
  release_type VARCHAR(20) NOT NULL DEFAULT 'single', -- single | album | ep
  language VARCHAR(10) DEFAULT 'ru',
  lyrics TEXT,
  -- Обложка и аудио
  cover_path VARCHAR(500),
  audio_path VARCHAR(500) NOT NULL,
  -- Авторы
  author_lyrics VARCHAR(255),   -- автор текста (кто написал слова)
  author_beat VARCHAR(255),     -- автор бита (продюсер)
  author_composer VARCHAR(255), -- автор всего / композитор
  copyright_info TEXT,
  -- Дата и пресейв
  release_date DATE,
  presave_url VARCHAR(500),    -- ссылка на пресейв (Spotify, Apple Music и т.д.)
  -- Метаданные
  bpm INT,
  musical_key VARCHAR(10),
  mood TEXT[],
  tags TEXT[],
  explicit BOOLEAN DEFAULT false,
  isrc VARCHAR(50),
  -- Статус
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft | pending | approved | rejected
  moderator_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Дополнительные участники (сведение, мастеринг и т.д.)
CREATE TABLE track_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  role VARCHAR(100),  -- например: сведение, мастеринг
  name VARCHAR(255),
  sort_order INT DEFAULT 0
);
```

### Таблица albums

```sql
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255),
  type VARCHAR(20) NOT NULL DEFAULT 'single', -- single | ep | album
  cover_path VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/albums/my` | Список альбомов текущего артиста (для select). |
| POST | `/api/albums` | Создать альбом (title, type, cover file). |
| POST | `/api/tracks` | Загрузка трека (multipart: audio, cover; JSON или form-data). |
| PATCH | `/api/tracks/:id` | Обновить черновик. |
| POST | `/api/tracks/:id/submit` | Отправить на модерацию (status → pending). |

### Поля для POST /api/tracks (multipart/form-data)

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| title | string | да | Название трека |
| artist_name | string | да | Исполнитель |
| audio | file | да | Аудиофайл |
| cover | file | нет | Обложка |
| release_type | string | да | single / album / ep |
| album_id | uuid | нет | ID альбома (если не сингл) |
| lyrics | string | нет | Текст песни |
| author_lyrics | string | нет | Автор текста |
| author_beat | string | нет | Автор бита (продюсер) |
| author_composer | string | нет | Автор всего / композитор |
| copyright_info | string | нет | Информация об авторских правах |
| release_date | date | нет | Дата релиза (YYYY-MM-DD) |
| presave_url | string | нет | Ссылка на пресейв |
| language | string | нет | ru / en / other |
| bpm | int | нет | BPM |
| musical_key | string | нет | Тональность (C, D#, и т.д.) |
| mood | array | нет | Массив настроений |
| tags | string/array | нет | Теги (через запятую или массив) |
| explicit | bool | нет | Содержит ненормативную лексику |
| isrc | string | нет | ISRC |

---

## 3. Модерация

### API (админ)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/moderation/artist-applications` | Список заявок артистов. Query: `?status=pending|approved|rejected|all`, `?search=...` |
| GET | `/api/moderation/artist-applications/:id` | Детали заявки (все поля + документы с URL скачивания). |
| POST | `/api/moderation/artist-applications/:id/approve` | Одобрить (при необходимости выдать пользователю роль `artist`). |
| POST | `/api/moderation/artist-applications/:id/reject` | Отклонить. Тело: `{"comment": "причина"}`. |

| GET | `/api/moderation/tracks` | Список треков на модерации. Query: `?status=...`, `?search=...` |
| GET | `/api/moderation/tracks/:id` | Детали трека (все поля + URL аудио/обложки). |
| POST | `/api/moderation/tracks/:id/approve` | Одобрить (status → approved). |
| POST | `/api/moderation/tracks/:id/reject` | Отклонить. Тело: `{"reason": "..."}`. |

| GET | `/api/moderation/albums` | Список альбомов на модерации. Query: `?status=...`, `?search=...` |
| GET | `/api/moderation/albums/:id` | Детали альбома. |
| POST | `/api/moderation/albums/:id/approve` | Одобрить. |
| POST | `/api/moderation/albums/:id/reject` | Отклонить. Тело: `{"comment": "..."}`. |

Ответы списков должны содержать поля, которые отображаются в карточках:

- Заявки: `id`, `artist_name`, `full_name`, `date` (created_at), `status`, `bio` (коротко).
- Треки: `id`, `title`, `artist_name`, `created_date`, `status`, `cover_url`, `audio_url` и т.д.
- Альбомы: `id`, `album_title`/`title`, `artist_name`, `date`, `status`.

---

## 4. Мои заявки (My Requests)

Используется заявка на артиста для текущего пользователя.

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/artist-applications/me` | Текущая/последняя заявка пользователя. Ответ: `{ id, status, submitted_at, moderator_comment, current_step }` или 404. |

Если заявки нет — фронтенд показывает «Подать заявку». Если есть — кнопки «Продолжить заполнение» (draft), «Перейти в профиль артиста» (approved), «Подать заявку снова» (rejected).

---

## 5. Общее

- **Авторизация:** все перечисленные маршруты (кроме публичных) должны проверять JWT/session и, где нужно, роль `admin` (для `/api/moderation/*`).
- **Файлы:** документы заявок, обложки и аудио храните в файловом хранилище (или локально), в БД — только путь; для отдачи файлов по ссылке нужны эндпоинты вида `GET /api/files/:type/:id` или подписанные URL.
- **Моки на фронте:** после реализации API замените вызовы моков на реальные запросы к этим эндпоинтам (в `api/` и в страницах).

После реализации описанных таблиц и эндпоинтов фронтенд можно перевести с моков на эти API.
