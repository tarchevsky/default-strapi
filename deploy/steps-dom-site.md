# Деплой dom на тот же сервер

Окружение (Node, Bun, pm2, PostgreSQL, Nginx) уже установлено. Делаем только специфичные для проекта шаги.

## 1. Создание новой базы данных

```bash
sudo -u postgres psql -c "CREATE DATABASE dom OWNER manager ENCODING 'UTF8';"
```

возможна такая ошибка

```
ivan@5842235-io87092:~$ sudo -u postgres psql -c "CREATE DATABASE dom OWNER manager ENCODING 'UTF8';"
[sudo] password for ivan:
could not change directory to "/home/ivan": Permission denied
CREATE DATABASE
ivan@5842235-io87092:~$ psql -l
psql: error: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: FATAL:  role "ivan" does not exist
```

база данных создана ошибка не страшна - можно даже проверить под суперюзером

```
sudo -u postgres psql -l
```

дадим привилегии manager для управления базой

```
sudo -u postgres psql
```

подключимся к базе

```
\c dom
```

```
GRANT ALL PRIVILEGES ON DATABASE dom TO manager;
```

мы создали базу и права юзера к ней

Используем того же пользователя `manager`, просто создаём новую базу.

## 2. Клонирование проекта

```bash
mkdir -p ~/dom && cd ~/dom
git clone git@github.com:username/repo.git .
```

Замени `username/repo` на свой репозиторий.

## 3. Создание .env

Создай корневой `.env` в `~/dom/.env` из example:

**Важно:**

порты + 1 чтобы не было конфликтов

## 4. Установка зависимостей

```bash
cd ~/dom/back
bun install

cd ~/dom/front
bun install
```

## 5. Сборка и запуск Strapi

```bash
cd ~/dom/back
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 start --name dom-back "bun run start" --cwd ~/dom/back --update-env
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
cd ~/dom/front
set +H && set -a && source ../.env && set +a && set -H
bun run build
```

если не получается билд из-за соседних ssl делаем

```shell
NEXT_PUBLIC_STRAPI_URL=http://127.0.0.1:1337 bun run build
```

```shell
PORT=3000 pm2 start --name dom-front "bun run start" --cwd ~/dom/front --update-env
pm2 save && pm2 startup
```

Проверь: `pm2 status` — оба процесса должны быть `online`.

## 7. Настройка Nginx

### Создай файл апстримов

Скопируй файл:

```bash
sudo tee /etc/nginx/conf.d/dom.upstream.conf >/dev/null < ~/dom/deploy/nginx.dom.upstreams.conf
```

Или создай вручную:

```bash
sudo nano /etc/nginx/conf.d/dom.upstream.conf
```

Вставь:

```nginx
upstream dom_strapi {
    server 127.0.0.1:1337;
}

upstream dom_next {
    server 127.0.0.1:3000;
}
```

### Создай конфиг виртуального хоста

```bash
sudo tee /etc/nginx/sites-available/dom >/dev/null < ~/dom/deploy/nginx.dom.conf
```

Или скопируй содержимое из `deploy/nginx.com.conf` вручную.

### Включи сайт

```bash
sudo ln -sf /etc/nginx/sites-available/dom /etc/nginx/sites-enabled/dom
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
cd ~/dom/back
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 restart dom-back --update-env

cd ~/dom/front
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 stop dom-front
pm2 delete dom-front
PORT=3000 pm2 start --name dom-front "bun run start" --cwd ~/dom/front --update-env
pm2 save && pm2 startup
```

Проверь: `pm2 status`, открой `https://domhome.webtm.ru/admin`.

## 9. Ревалидация

В Strapi админке: Settings → Webhooks → Create:

- URL: `https://dom/api/revalidate`
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
