На основе

https://sereja-art.ru/blog/ustanovka-strapi-postgre-sql-na-ubuntu
https://sereja-art.ru/blog/deploj-prilozheniya-next-js-na-ubuntu-vps

# Шаги деплоя

1.  Подготовка сервера
    - Под root обнови систему: `sudo apt update && sudo apt upgrade && sudo apt install nginx`.
    - Создай пользователя `user` с sudo, добавь SSH-ключи, отключи парольный вход.
    - Включи UFW: `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable`.
    - Создай каталог проекта: `mkdir -p ~/puhovvv.ru && cd ~/puhovvv.ru`.
2.  Установка окружения
    - Поставь Node 20: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -`, затем `sudo apt install -y nodejs build-essential git unzip`.
    - Установи zshrc:

    ```shell
    sudo apt update
    ```

    ```
    sudo apt install -y zsh
    ```

    - убедись, что установлен

    ```
    which zsh
    ```

    - Сделайте zsh shell по умолчанию для вашего пользователя:

    ```shell
    chsh -s $(which zsh)
    ```

    - создай пустой конфиг zsh, чтобы при первом входе не показывался мастер настройки:

    ```shell
    touch ~/.zshrc
    ```

    - перезагрузите сервер

    - после входа делаем цветной промпт (путь и пользователь). _Если при первом входе в zsh появился мастер «zsh-newuser-install» — нажми `0` и Enter (создаст пустой ~/.zshrc), затем продолжай._

    ```ssh
    echo "PROMPT='%F{green}%n@%m%f:%F{blue}%~%f%# '" >> ~/.zshrc
    source ~/.zshrc
    ```

- Установи Bun: `curl -fsSL https://bun.sh/install | bash`, затем добавь путь в `~/.zshrc`:
  `echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.zshrc && echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.zshrc`
  После этого перезапусти shell: `exec $SHELL -l`.
- Установи pm2 глобально: `bun install --global pm2`

3.  PostgreSQL

- `sudo apt install postgresql postgresql-contrib`, при необходимости установи локаль `ru_RU.UTF-8`:
  `sudo apt install locales && sudo locale-gen ru_RU.UTF-8 && sudo update-locale LC_ALL=ru_RU.UTF-8 LANG=ru_RU.UTF-8`
  После этого перелогинься и проверь `locale`.
- Создай роль (пользователя) и базу — имена в нижнем регистре, в `.env` потом указывай `DATABASE_USERNAME=crpdu`:
  `sudo -u postgres psql -c "CREATE ROLE crpdu WITH LOGIN PASSWORD 'Mg8nQwR5tY7xZ2pL';"`
  `sudo -u postgres psql -c "CREATE DATABASE puhovvv OWNER crpdu ENCODING 'UTF8';"`
  (Если роль уже есть: `ALTER ROLE crpdu WITH LOGIN PASSWORD 'Mg8nQwR5tY7xZ2pL';`. Если база уже есть под другим владельцем: `ALTER DATABASE puhovvv OWNER TO crpdu;`)
- Проверка: `sudo -u postgres psql -c "\l"` — в списке должна быть база `puhovvv`, Owner `crpdu`. (Список баз и админка — только через `sudo -u postgres psql`: роли ОС itdev3/root в PostgreSQL нет.) Вход под приложением: `PGPASSWORD='Mg8nQwR5tY7xZ2pL' psql -h 127.0.0.1 -U crpdu -d puhovvv -c 'SELECT 1;'`

4.  Репозиторий

- Клонируй проект: `git clone git@github.com:tarchevsky/default-strapi.git .`.
- Создай корневой `.env` (единственный по проекту из `deploy/constants.md`) и задай продовые переменные для бэка и фронта; блок публичных URL Strapi оставь пустым до настройки nginx/SSL.
- В `back` и `front` выполни `bun install`; проверь что каталоги `public/uploads` доступны для записи.

5.  Strapi

- `cd ~/puhovvv.ru/back`, выполни `set +H && set -a && source ../.env && set +a && set -H`.
- Собери админку: `bun run build`.
- Зарегистрируй сервис в pm2: `pm2 start --name puhovvv-back "bun run start" --cwd ~/puhovvv.ru/back --update-env`; затем `pm2 save && pm2 startup`. **Важно:** выполни команду, которую выведет `pm2 startup` (sudo env PATH=... pm2 startup systemd ...) — без неё после перезагрузки процессы не поднимутся.
- Для первичного входа пробрось порт: `ssh -L 1338:127.0.0.1:1338 itdev3@193.233.102.91` и открой `http://localhost:1338/admin`, создай админа через веб-интерфейс.
- В админке включи публичные права для нужных API (например Page, Header и т.д.). Сохрани.
- Проверь Strapi: `pm2 status puhovvv-back`, при необходимости `pm2 restart puhovvv-back`.
- После настройки nginx и SSL админка откроется по `https://puhovvv.ru/admin`.

6.  Next.js

- `cd ~/puhovvv.ru/front`, выполни `set +H && set -a && source ../.env && set +a && set -H`.
- Убедись, что в `.env` задан `NEXT_PUBLIC_STRAPI_URL_FALLBACK=http://127.0.0.1:1337`, чтобы сборка не пыталась ходить к домену до настройки nginx.
- Выполни `bun run build`, подними SSR: `PORT=3000 pm2 start --name puhovvv-front "bun run start" --cwd ~/puhovvv.ru/front --update-env`.
- Вернись в корень и обнови список процессов: `cd .. && pm2 save`.

7.  Nginx

- Скопируй апстримы: `sudo tee /etc/nginx/conf.d/puhovvv.upstream.conf >/dev/null < ~/puhovvv.ru/deploy/nginx.puhovvv.upstreams.conf`.
- Заполни виртуальный хост: `sudo tee /etc/nginx/sites-available/puhovvv >/dev/null < ~/puhovvv.ru/deploy/nginx.puhovvv.conf` (или открой `sudo nano` и вставь содержимое файла).
- **Важно:** конфиг в репо без SSL. Если на сервере уже настроен certbot (шаг 8), то после перезаписи конфига через `tee` SSL пропадёт. После любого обновления `nginx.puhovvv.conf` из репо нужно снова выполнить `sudo certbot --nginx -d puhovvv.ru` — certbot добавит 443 и сертификаты.
- Включи сайт: `sudo ln -sf /etc/nginx/sites-available/puhovvv /etc/nginx/sites-enabled/puhovvv && sudo rm -f /etc/nginx/sites-enabled/default`.
- Проверь конфиг и перезагрузи: `sudo nginx -t && sudo systemctl reload nginx`.

8.  SSL

- Установи snap (на многих серверах его нет по умолчанию): `sudo apt update && sudo apt install -y snapd`. Затем перелогинься или выполни `exec $SHELL -l`, чтобы `snap` был в PATH.
- Установи core и обнови: `sudo snap install core && sudo snap refresh core`.
- Затем поставь сам certbot: `sudo snap install --classic certbot`
- затем сделай ссылку `sudo ln -s /snap/bin/certbot /usr/bin/certbot`
- Выполни `sudo certbot --nginx -d puhovvv.ru`, включи автоматический редирект на HTTPS и проверь таймер обновления.
- Для проверки продления запусти `sudo certbot renew --dry-run`, затем `sudo certbot certificates`, открой конфиг `sudo nano /etc/nginx/sites-available/puhovvv` и сравни `Certificate Path` и `Private Key Path` с директивами `ssl_certificate` и `ssl_certificate_key`; при расхождении обнови файл, проверь `sudo nginx -t` и перегрузи `sudo systemctl reload nginx`.
- После успешной проверки домена:
- Добавь в `~/puhovvv.ru/.env` строки `STRAPI_PUBLIC_URL=https://puhovvv.ru`, `STRAPI_ADMIN_URL=https://puhovvv.ru/admin`, `STRAPI_PROXY=true`.
- **Фронт (динамические страницы, категории):** в том же `.env` задай `NEXT_PUBLIC_STRAPI_URL`. Значение вшивается при сборке Next.js, поэтому без него или после смены — пересобери фронт. Для SSR на том же сервере надёжнее прямой доступ: `NEXT_PUBLIC_STRAPI_URL=http://127.0.0.1:1337` (оставь `NEXT_PUBLIC_STRAPI_URL_FALLBACK=http://127.0.0.1:1337`). Если хочешь ходить через домен: `NEXT_PUBLIC_STRAPI_URL=https://puhovvv.ru`.
- Применяй обновлённые переменные: `cd ~/puhovvv.ru/back && set -a && source ../.env && set +a`.
- Пересобери и перезапусти Strapi: `bun run build && pm2 restart puhovvv-back --update-env`.
- Пересобери и перезапусти фронт (обязательно после смены `NEXT_PUBLIC_*`): `cd ~/puhovvv.ru/front && set -a && source ../.env && set +a && bun run build && pm2 stop puhovvv-front && pm2 delete puhovvv-front && PORT=3000 pm2 start --name puhovvv-front "bun run start" --cwd ~/puhovvv.ru/front --update-env && cd .. && pm2 save`.
- Проверь состояние: `pm2 status`; открой `https://puhovvv.ru/admin` и убедись, что предупреждения по SSL нет, а Content-Type Builder загружается без ошибок JSON.
- При необходимости сверяй пути до сертификатов: `sudo certbot certificates`; проверяй ответ API командой `curl -k https://puhovvv.ru/admin/init` — должен вернуться JSON.

9.  Ревалидация

- В Strapi настрой вебхук POST на `https://puhovvv.ru/api/revalidate` с заголовком `x-webhook-secret` и значением из `.env`.
- Проверь, что `front/src/app/api/revalidate/route.ts` читает секрет из корневого `.env` и вызывает нужные `revalidatePath`.

10. Обслуживание

- Логи и перезапуски: `pm2 logs puhovvv-back`, `pm2 restart puhovvv-front`; обновления: на сервере `cd ~/puhovvv.ru && git pull`, затем в `back`: `bun install && bun run build && pm2 restart puhovvv-back`, в `front`: `bun install && bun run build && pm2 restart puhovvv-front` (или из корня: `cd back && bun install && bun run build && pm2 restart puhovvv-back && cd ../front && bun install && bun run build && pm2 restart puhovvv-front`), затем `pm2 save`.
- Бэкапы: настроить cron с `pg_dump puhovvv > /var/backups/puhovvv-$(date +%F).sql`, хранить копии вне сервера.
- Мониторинг: `df -h`, `systemctl status nginx`, периодически проверяй срок действия SSL.

### На будущее: несколько сайтов на одном сервере

Чтобы puhovvv.ru не «пропадал» после деплоя другого сайта (например adel.pro):

1. **Не перезаписывать конфиг puhovvv без восстановления SSL.** Конфиг в репо без SSL. Если на сервере выполнили `sudo tee .../puhovvv < ~/puhovvv.ru/deploy/nginx.puhovvv.conf`, сразу после этого выполнить: `sudo certbot --nginx -d puhovvv.ru`, затем `sudo nginx -t && sudo systemctl reload nginx`.
2. **Не отключать puhovvv при включении второго сайта.** В `sites-enabled` должны оставаться оба: `adel` и `puhovvv`. Включать второй сайт так: `sudo ln -sf /etc/nginx/sites-available/adel /etc/nginx/sites-enabled/adel` — без удаления симлинка на puhovvv и без `rm .../default`, если default уже удалён.
3. Если puhovvv.ru по HTTPS отдаёт ошибку сертификата, а по HTTP открывается другой сайт — см. ниже блок «Два сайта на одном сервере» в разделе «Решение проблем».

## При удалении в базе данных, схеме, бэке

**Удаление на проде (после удаления фичи в коде):** закоммить и запушить, на сервере выполнить обновление (см. выше). API перестаёт существовать. Если в админке Strapi Collection Type (например Case) **всё ещё отображается** после `git pull` и рестартов — админка собрана из кэша. Нужна полная пересборка без кэша:

1. На сервере: `cd ~/puhovvv.ru && git pull` — убедись, что папки `back/src/api/case` нет (`ls back/src/api/`).
2. Очистить кэш и артефакты Strapi: `cd ~/puhovvv.ru/back && rm -rf .cache dist build`.
3. Пересобрать и перезапустить: `bun install && bun run build && pm2 restart puhovvv-back --update-env && pm2 save`.
4. Открыть админку и обновить страницу с полной перезагрузкой (Ctrl+Shift+R / Cmd+Shift+R).

Список content types Strapi берёт из папки `src/api/*` при сборке; без `api/case` и после очистки `.cache`/`dist`/`build` раздел Case в админке пропадёт.

Таблицы кейсов в PostgreSQL при этом остаются. Удалить при необходимости: сначала посмотреть имена `sudo -u postgres psql -d puhovvv -c '\dt *cases*'`, затем, например, `DROP TABLE IF EXISTS cases_components_lnk CASCADE; DROP TABLE IF EXISTS cases_components CASCADE; DROP TABLE IF EXISTS cases CASCADE;` (подставь точные имена из вывода).

### Решение проблем

- **Меню и иконки есть, а динамические страницы и категории не грузятся (404 или зависание):** данные страниц идут из Strapi при каждом запросе (SSR). Убедись, что в `.env` задан `NEXT_PUBLIC_STRAPI_URL` (например `http://127.0.0.1:1337`) и что фронт был собран уже с этим значением: `cd ~/puhovvv.ru/front && set -a && source ../.env && set +a && bun run build && pm2 restart puhovvv-front --update-env`. Меню при недоступности Strapi показывает запасной вариант, поэтому «работает» даже без API.
- **После перезагрузки PM2 пустой:** выполни `pm2 resurrect` — процессы подхватятся из `~/.pm2/dump.pm2`. Чтобы в следующий раз поднимались сами, настрой автозапуск: `pm2 startup`, затем выполни выведенную sudo-команду, потом `pm2 save`.
- Статус сервисов: `pm2 status`; логи: `pm2 logs puhovvv-front --lines 100`.
- Пересоздать фронт: `pm2 stop puhovvv-front && pm2 delete puhovvv-front`, затем `PORT=3000 pm2 start --name puhovvv-front "bun run start" --cwd ~/puhovvv.ru/front --update-env`, затем `pm2 save`.

- **Два сайта на одном сервере (puhovvv.ru и adel.pro):** если после деплоя adel.pro по HTTPS puhovvv.ru выдаёт ошибку сертификата/HSTS, а по HTTP открывается adel.pro — nginx отдаёт один и тот же виртуальный хост (adel) на оба домена. Причины: виртуальный хост puhovvv отключён или перезаписан. На сервере проверь:
  - `ls -la /etc/nginx/sites-enabled/` — должны быть оба: `adel` и `puhovvv`. Если `puhovvv` нет: `sudo ln -sf /etc/nginx/sites-available/puhovvv /etc/nginx/sites-enabled/puhovvv`.
  - `grep -l "server_name.*puhovvv" /etc/nginx/sites-available/*` — должен быть файл с `server_name puhovvv.ru`.
  - Конфиг puhovvv должен содержать блок для 443 с `ssl_certificate` (certbot добавляет при `certbot --nginx -d puhovvv.ru`). Если в `sites-available/puhovvv` только порт 80: восстанови из репо и заново включи SSL: `sudo tee /etc/nginx/sites-available/puhovvv >/dev/null < ~/puhovvv.ru/deploy/nginx.puhovvv.conf`, затем `sudo certbot --nginx -d puhovvv.ru`, затем `sudo nginx -t && sudo systemctl reload nginx`.
  - После исправления: `sudo nginx -t && sudo systemctl reload nginx`. В браузере HSTS кэш для puhovvv.ru может мешать — открой сайт в режиме инкогнито или подожди, пока истечёт HSTS.
