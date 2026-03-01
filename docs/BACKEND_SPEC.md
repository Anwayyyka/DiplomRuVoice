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

Используются существующие сущности треков и альбомов; при необходимости расширить поля.

### Таблицы (дополнительные поля к существующим)

Для **tracks** (или аналог):

- `title`, `artist_name`, `album_id` (nullable), `release_type` (single/album/ep), `language`, `lyrics`
- `bpm` INT, `key` VARCHAR(10), `mood` TEXT[] или JSONB, `tags` TEXT[] или VARCHAR(500)
- `explicit` BOOLEAN, `isrc` VARCHAR(50)
- `composer`, `author_text`, `copyright_info` TEXT
- `release_date` DATE, `cover_path`, `audio_path`
- `status`: draft | pending | approved | rejected
- `moderator_comment`, `reviewed_at`

Для **albums** (если есть):

- `title`, `artist_id`/artist_name, `type` (single/ep/album), `cover_path`, `status`

Дополнительные авторы (опционально):

```sql
CREATE TABLE track_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  composer VARCHAR(255),
  author_text VARCHAR(255),
  sort_order INT DEFAULT 0
);
```

### API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/albums/my` или через артиста | Список альбомов текущего артиста (для select). |
| POST | `/api/albums` | Создать альбом (title, type, cover file). |
| POST | `/api/tracks` | Загрузка трека (multipart: audio, cover; JSON-поля в форме или отдельно). |
| PATCH | `/api/tracks/:id` | Обновить черновик. |
| POST | `/api/tracks/:id/submit` | Отправить на модерацию (status → pending). |

Тело создания трека (часть полей; файлы — multipart):

- Основное: `title`, `artist_name`, `album_id` (или создать новый), `release_type`, `language`, `lyrics`
- Мета: `bpm`, `key`, `mood[]`, `tags` (строка или массив), `explicit`, `isrc`
- Авторы: `composer`, `author`, `copyright`, массив дополнительных авторов
- Файлы: `cover` (file), `audio` (file), `release_date`

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
