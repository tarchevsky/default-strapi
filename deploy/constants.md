# Константы окружения

- **Расположение** `.env` хранится в `~/site/.env` и экспортируется перед сборкой обоих сервисов (`set -a && source ../.env && set +a`).
- **Генерация** значения для секретов выдаёт `openssl rand -hex 32`; массивы Strapi (`APP_KEYS`) перечисляем через запятую.
- **Strapi**
  - `APP_KEYS` — четыре уникальных ключа Strapi.
  - `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` — отдельные секреты CMS.
  - `HOST=127.0.0.1`, `PORT=1337`, `NODE_ENV=production` — сетевые параметры прод-сервиса.
  - `STRAPI_PUBLIC_URL=https://site.ru`, `STRAPI_ADMIN_URL=https://site.ru/admin`, `STRAPI_PROXY=true` — включаем доверие к nginx и публикуем корректные адреса; задаём только после настройки nginx/SSL.
  - `DATABASE_CLIENT=postgres`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SSL=false` — подключение к PostgreSQL.
- **Next.js**
  - `NEXT_PUBLIC_STRAPI_URL=https://site.ru` — публичный URL через nginx.
  - `NEXT_PUBLIC_STRAPI_URL_FALLBACK=http://127.0.0.1:1337` — прямой доступ к Strapi для сборок и SSR, пока домен недоступен.
  - `WEBHOOK_SECRET` — ключ ревалидации; совпадает со значением в Strapi вебхуке.
  - Порт SSR задаём при запуске: `PORT=3000 pm2 start --name adel-front "bun run start" ...`, в `.env` `PORT` оставляем 1337 для Strapi.
- **Переменные без дубликатов** дополнительные `.env.*` файлы не создаём; для временных настроек пользуемся export в shell.
- **Ротация** при смене паролей/секретов перезапускаем процессы: `pm2 restart adel-strapi adel-front`.
