# Деплой бэкенда BiLim AI (чтобы дуэль работала через интернет)

Чтобы два игрока с разных компьютеров могли играть в дуэль, бэкенд должен быть
доступен в интернете, а не только на `localhost`. Ниже — пошагово.

Понадобятся 3 вещи:
1. Облачная база данных (Render истёк, берём бесплатную постоянную — Neon).
2. Хостинг для Go-бэкенда (Render Web Service — есть бесплатный тариф).
3. Хостинг для фронтенда (GitHub Pages / Netlify / Vercel).

---

## Шаг 1. Облачная база данных (Neon)

1. Зайди на https://neon.tech → зарегистрируйся.
2. **Create Project** → регион поближе (Europe/US East).
3. Скопируй **Connection string** вида:
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
4. Сохрани её — это будет `DATABASE_URL`. Таблицы создадутся автоматически при старте.

## Шаг 2. Залить код на GitHub

Render деплоит из Git-репозитория. Если проекта ещё нет на GitHub:

```bash
cd "c:/Users/Sultan/Desktop/BilinAi-project/bilim react"
git init
git add .
git commit -m "BiLim AI"
# создай пустой репозиторий на github.com, затем:
git remote add origin https://github.com/ТВОЙ_ЛОГИН/bilim.git
git branch -M main
git push -u origin main
```

> ВАЖНО: файл `backend/.env` с паролями НЕ должен попасть в публичный репозиторий.
> Он уже в `.dockerignore`; добавь его и в `.gitignore` (см. ниже).

## Шаг 3. Бэкенд на Render

1. https://dashboard.render.com → **New** → **Web Service**.
2. Подключи свой GitHub-репозиторий.
3. Настройки:
   - **Root Directory:** `bilim react/backend`
   - **Runtime / Environment:** `Docker` (Render сам найдёт `Dockerfile`)
   - **Instance Type:** Free
4. **Environment Variables** (раздел Environment) — добавь:
   | Ключ | Значение |
   |------|----------|
   | `JWT_SECRET` | любая длинная случайная строка |
   | `DATABASE_URL` | строка подключения из Neon (Шаг 1) |
   | `SMTP_EMAIL` | твой Gmail |
   | `SMTP_PASSWORD` | app-пароль Gmail |
   | `ALLOWED_ORIGINS` | URL фронтенда (заполнишь после Шага 4) |
5. **Create Web Service**. Render соберёт Docker-образ и запустит.
6. Получишь адрес вида `https://bilim-backend.onrender.com` — это твой API URL.
   Проверь: открой `https://bilim-backend.onrender.com/api/auth/send-code?email=x`
   методом POST — должен ответить (не «connection refused»).

> Render Free усыпляет сервис после ~15 мин простоя; первый запрос после сна
> «будит» его ~30 сек. Для постоянной работы — платный тариф или Railway/Fly.

## Шаг 4. Фронтенд

1. В `bilim react/.env` поставь адрес задеплоенного бэкенда:
   ```
   VITE_API_URL=https://bilim-backend.onrender.com
   ```
2. Пересобери: `npm run build` → папка `dist/`.
3. Выложи `dist/` на любой статический хостинг:
   - **Netlify / Vercel:** перетащи папку `dist` или подключи репозиторий.
   - **GitHub Pages:** запушь содержимое `dist/` в ветку `gh-pages`.
4. Получишь URL фронтенда, например `https://твой-сайт.netlify.app`.

## Шаг 5. Связать CORS

1. Вернись в Render → переменная `ALLOWED_ORIGINS` → впиши URL фронтенда
   (без слеша в конце), например:
   ```
   ALLOWED_ORIGINS=https://твой-сайт.netlify.app
   ```
   Несколько адресов — через запятую.
2. Render автоматически перезапустит сервис.

Готово. Теперь два игрока с разных устройств заходят на URL фронтенда,
создают/вводят код комнаты и играют дуэль через интернет.

---

## Локальная игра (без интернета)

На одном компьютере (две вкладки браузера) или в одной Wi-Fi-сети:
- `VITE_API_URL=http://localhost:8080` (или `http://ТВОЙ_LAN_IP:8080` для двух
  устройств в одной сети — тогда добавь этот origin в `ALLOWED_ORIGINS`).
- Запусти `start.bat`.
