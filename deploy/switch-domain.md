# Миграция с adel.webtm.ru на adel.pro

## Предподготовка (локально)

1. Обнови корневой `.env`: замени https://adel.webtm.ru на https://adel.pro/.

2. Обнови `deploy/nginx.conf`: замени все `adel.webtm.ru` на `adel.pro` (4 места в файле).

3. Загрузи изменения на сервер.

## Шаг 1: Обновить nginx конфиг на сервере

```bash
sudo tee /etc/nginx/sites-available/adel >/dev/null < ~/adel.pro/deploy/nginx.conf
```

Проверь и перезагрузи:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Шаг 2: Установить SSL сертификат для adel.pro

На сервере:

```bash
sudo certbot --nginx -d adel.pro
```

При вводе выбери автоматический редирект на HTTPS (вариант 2).

Проверь сертификаты:

```bash
sudo certbot certificates
```

## Шаг 3: Применить переменные окружения и перезапустить сервисы

```bash
cd ~/adel.pro/back
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 restart strapi --update-env
```

```bash
cd ~/adel.pro/front
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 delete adel-front
PORT=3000 pm2 start --name adel-front "bun run start" --cwd ~/adel.pro/front --update-env
pm2 save
```

## Шаг 4: Проверка

```bash
pm2 status
```

Открой в браузере: `https://adel.pro/admin` — должно загрузиться без ошибок SSL.

Проверь API:

```bash
curl -k https://adel.pro/admin/init
```

Должен вернуться JSON.

## Шаг 5: Обновить webhook в Strapi

В админке: Settings → Webhooks → найди реквизит на `https://adel.webtm.ru/api/revalidate`.

Измени URL на `https://adel.pro/api/revalidate` и сохрани.
