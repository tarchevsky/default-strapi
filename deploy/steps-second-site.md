# Деплой domhome.webtm.ru на тот же сервер

Окружение (Node, Bun, pm2, PostgreSQL, Nginx) уже установлено. Делаем только специфичные для проекта шаги.

## 1. Создание новой базы данных

```bash
sudo -u postgres psql -c "CREATE DATABASE cosmeya OWNER manager ENCODING 'UTF8';"
```

Используем того же пользователя `manager`, просто создаём новую базу.

## 2. Клонирование проекта

```bash
mkdir -p ~/domhome.webtm.ru && cd ~/domhome.webtm.ru
git clone git@github.com:username/repo.git .
```

Замени `username/repo` на свой репозиторий.

## 3. Создание .env

Создай корневой `.env` в `~/domhome.webtm.ru/.env`:

```env
# Database
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=cosmeya
DATABASE_USERNAME=manager
DATABASE_PASSWORD=ZmxNcvb-!10

# Strapi
HOST=0.0.0.0
PORT=1337
APP_KEYS=генерируй_новые_ключи
API_TOKEN_SALT=генерируй_новый_соль
ADMIN_JWT_SECRET=генерируй_новый_секрет
TRANSFER_TOKEN_SALT=генерируй_новый_соль
JWT_SECRET=генерируй_новый_секрет

# Strapi Public URLs (заполнишь после SSL)
STRAPI_PUBLIC_URL=
STRAPI_ADMIN_URL=
STRAPI_PROXY=

# Next.js
NEXT_PUBLIC_STRAPI_URL_FALLBACK=http://127.0.0.1:1337
NEXT_PUBLIC_STRAPI_URL=

# Webhook
WEBHOOK_SECRET=генерируй_новый_секрет
```

**Важно:**

- `PORT=1337`
- `DATABASE_NAME=cosmeya`
- Генерируй новые ключи командой `openssl rand -base64 32`

## 4. Установка зависимостей

```bash
cd ~/domhome.webtm.ru/back
bun install

cd ~/domhome.webtm.ru/front
bun install
```

## 5. Сборка и запуск Strapi

```bash
cd ~/domhome.webtm.ru/back
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 start --name dom-back "bun run start" --cwd ~/domhome.webtm.ru/back --update-env
pm2 save && pm2 startup
```

Проверь: `pm2 status` — должен быть `dom-back` со статусом `online`.

Пробрось порт для первичной настройки:

```bash
ssh -L 1337:127.0.0.1:1337 ivan@109.73.194.128
```

Открой `http://localhost:1337/admin`, создай админа, включи публичные права (Settings → Users & Permissions → Roles → Public → Case: `find`, `findOne`).

## 6. Сборка и запуск Next.js

```bash
cd ~/domhome.webtm.ru/front
set +H && set -a && source ../.env && set +a && set -H
bun run build
```

если не получается билд из-за соседних ssl делаем

```shell
NEXT_PUBLIC_STRAPI_URL=http://127.0.0.1:1337 bun run build
```

```shell
PORT=3000 pm2 start --name dom-front "bun run start" --cwd ~/domhome.webtm.ru/front --update-env
pm2 save
```

Проверь: `pm2 status` — оба процесса должны быть `online`.

## 7. Настройка Nginx

### Создай файл апстримов

```bash
sudo nano /etc/nginx/conf.d/cosmeya.upstream.conf
```

Вставь:

```nginx
upstream cosmeya_strapi {
    server 127.0.0.1:1337;
}

upstream cosmeya_next {
    server 127.0.0.1:3000;
}
```

### Создай конфиг виртуального хоста

```bash
sudo tee /etc/nginx/sites-available/cosmeya >/dev/null < ~/domhome.webtm.ru/deploy/nginx.cosmeya.conf
```

Или скопируй содержимое из `deploy/nginx.cosmeya.conf` вручную.

### Включи сайт

```bash
sudo ln -sf /etc/nginx/sites-available/cosmeya /etc/nginx/sites-enabled/cosmeya
sudo nginx -t
sudo systemctl reload nginx
```

## 8. SSL

```bash
sudo certbot --nginx -d domhome.webtm.ru -d www.domhome.webtm.ru
```

Выбери автоматический редирект на HTTPS.

Проверки автообновления

```shell
# После установки SSL добавить проверки:
sudo certbot renew --dry-run
sudo systemctl status snap.certbot.renew.timer
sudo systemctl list-timers | grep certbot
```

Применяй изменения:

```bash
cd ~/domhome.webtm.ru/back
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 restart dom-back --update-env

cd ~/domhome.webtm.ru/front
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 stop dom-front
pm2 delete dom-front
PORT=3000 pm2 start --name dom-front "bun run start" --cwd ~/domhome.webtm.ru/front --update-env
pm2 save
```

Проверь: `pm2 status`, открой `https://domhome.webtm.ru/admin`.

## 9. Ревалидация

В Strapi админке: Settings → Webhooks → Create:

- URL: `https://domhome.webtm.ru/api/revalidate`
- Headers: `x-webhook-secret: значение_из_env`
- Events: выбери нужные (например, Entry create/update/delete)

## 10. Проверка

```bash
pm2 status
pm2 logs dom-front --lines 50
pm2 logs dom-back --lines 50
```

Открой сайт в браузере, проверь что всё работает.

---

**Готово!** Второй сайт развёрнут на том же сервере с изолированными процессами, портами и базой данных.
