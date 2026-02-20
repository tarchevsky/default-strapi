# Webhook Strapi → Next.js (2025)

## Назначение

Изменения в Strapi должны немедленно инвалидировать кэш Next.js и, при необходимости, пересобрать фронт. Для этого Strapi шлёт POST-запросы в Next.js API `POST /api/revalidate`, который запускает `revalidateTag` и команду `bun run build`/`pm2 restart dom-front`.

## Переменные окружения

- `NEXTJS_WEBHOOK_URL` — полный URL обработчика фронта **с путём** `/api/revalidate`, например `https://front.example.com/api/revalidate`. Без этого сегмента Strapi не попадёт в нужный роут Next.js.
- `WEBHOOK_SECRET` — общий секрет, который кладётся в тело запроса (`secret`) и проверяется на фронте. Значение должно совпадать в `.env` Strapi и `.env` фронта.

После изменения переменных перезапусти Strapi (`pm2 restart dom-back` или docker контейнер).

## Что уже настроено в Strapi

1. Сервис `back/src/api/webhook/services/webhook.ts`:
   - отправляет JSON `{ contentType, action, data, timestamp, secret }`;
   - делает до 3 попыток с backoff и логирует результат;
   - таймаут 15 сек.
2. Контроллер `back/src/api/webhook/controllers/webhook.ts` экспонирует ручку `POST /api/webhook/trigger` (см. `routes/webhook.ts`) для ручного запуска.
3. Контроллер `api::case.case` уже вызывает `sendWebhook` на `create/update/delete`, поэтому кейсы ревалидируются автоматически.

Чтобы подключить другие типы (header, site-setting и т.д.), добавь аналогичный вызов `strapi.service('api::webhook.webhook').sendWebhook(...)` в их контроллеры или lifecycle hooks.

## Настройка вебхука в админке Strapi 2025

1. Зайди в Strapi Admin → `Settings → Global Settings → Webhooks`.
2. Создай вебхук **Next Revalidate** (или любое имя):
   - **URL**: `https://<домен фронта>/api/revalidate` (Strapi всегда отправляет POST, выбор метода не отображается в UI).
   - **Headers**: добавь `x-webhook-secret: <WEBHOOK_SECRET из .env>`.
   - **Events**:
     - В блоке `Entry events` включи галочки `Create / Update / Delete / Publish / Unpublish`.
     - В блоке `Media events` включи `Create / Update / Delete`, чтобы обновления файлов тоже уходили на фронт.
   - **Enable**: включён.
3. Сохрани и нажми `Trigger` в карточке вебхука, чтобы убедиться, что Strapi видит статус 200.
4. При появлении новых типов контента просто добавь соответствующие `Entry.*` события в этот же вебхук.

## Логика на фронте

Файл `front/src/app/api/revalidate/route.ts`:

- проверяет `WEBHOOK_SECRET` (из body или header `x-webhook-secret`);
- вызывает `revalidateTag` для кейсов, header, site-setting, media;
- для `header` дополнительно запускает `bun run build` + `pm2 restart dom-front`.

## Пошаговая настройка

1. **Env**: в `.env` Strapi и Next.js прописать `NEXTJS_WEBHOOK_URL=https://<домен фронта>/api/revalidate` и общий `WEBHOOK_SECRET`.
2. **Рестарт сервисов**: перезапустить Strapi и Next.js (или хотя бы Strapi после правок env).
3. **Проверка авторизации**: убедиться, что на фронте в `.env` тоже выставлен `WEBHOOK_SECRET`, иначе `/api/revalidate` будет отвечать 401.
4. **Тест**:
   ```bash
   curl -i -X POST https://sitename.ru/api/revalidate \
   -H 'Content-Type: application/json' \
   -d '{
    "secret":"<WEBHOOK_SECRET>",
    "contentType":"case",
    "action":"update",
    "data":{"attributes":{"Slug":"test"}}
   }'
   ```
   В логах Strapi появится `Webhook отправлен`, а на фронте — сообщения о ревалидации/пересборке.

## Диагностика

- **401 с фронта** — разные `WEBHOOK_SECRET`.
- **ETIMEDOUT** — фронт недоступен или firewall блокирует порт 3000/443.
- **Повторные срабатывания** — Strapi делает 3 попытки; если фронт успевает отработать позже, можно увеличить таймаут в сервисе.
- **Нужно руками дернуть** — отправь POST на `/api/webhook/trigger` с нужным `contentType`/`action`.
