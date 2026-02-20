На основе

https://sereja-art.ru/blog/ustanovka-strapi-postgre-sql-na-ubuntu
https://sereja-art.ru/blog/deploj-prilozheniya-next-js-na-ubuntu-vps

# Шаги деплоя

1.  Подготовка сервера
    - Под root обнови систему: `sudo apt update && sudo apt upgrade && sudo apt install nginx`.
    - Создай пользователя `deploy` с sudo, добавь SSH-ключи, отключи парольный вход.
    - Включи UFW: `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable`.
    - Создай каталог проекта: `mkdir -p ~/adel.pro && cd ~/adel.pro`.
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
    chsh -s /bin/zsh
    ```

    - перезагрузите сервер

    - делаем как раньше в бэш - путь и пользователя цветной

    ```ssh
    echo "PROMPT='%F{green}%n@%m%f:%F{blue}%~%f%# '" >> ~/.zshrc
    source ~/.zshrc
    ```

- Установи Bun: `curl -fsSL https://bun.sh/install | bash`, затем добавь путь в `~/.zshrc`:
  `echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.zshrc && echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.zshrc`
  После этого перезапусти shell: `exec $SHELL -l`.
- Установи pm2 глобально: `bun install --global pm2` (если Bun не ставится — `sudo npm i -g pm2`).

3.  PostgreSQL

- `sudo apt install postgresql postgresql-contrib`, при необходимости установи локаль `ru_RU.UTF-8`:
  `sudo apt install locales && sudo locale-gen ru_RU.UTF-8 && sudo update-locale LC_ALL=ru_RU.UTF-8 LANG=ru_RU.UTF-8`
  После этого перелогинься и проверь `locale`.
- Создай пользователя и базу:
  `sudo -u postgres psql -c "CREATE ROLE manager WITH LOGIN PASSWORD 'ZmxNcvb-\!10';"` - здесь. экранируем ! обратным \
  Если надо поменять пароль
  `sudo -u postgres psql -c "ALTER ROLE manager WITH PASSWORD 'ZmxNcvb-\!10';"`
  `sudo -u postgres psql -c "CREATE DATABASE strapi OWNER manager ENCODING 'UTF8';"`

4.  Репозиторий

- Клонируй проект: `git clone git@github.com:tarchevsky/adel.pro.git .`.
- Создай корневой `.env` (единственный по проекту из `deploy/constants.md`) и задай продовые переменные для бэка и фронта; блок публичных URL Strapi оставь пустым до настройки nginx/SSL.
- В `back` и `front` выполни `bun install`; проверь что каталоги `public/uploads` доступны для записи.

5.  Strapi

- `cd ~/adel.pro/back`, выполни `set +H && set -a && source ../.env && set +a && set -H`.
- Собери админку: `bun run build`.
- Зарегистрируй сервис в pm2: `pm2 start --name adel-back "bun run start" --cwd ~/adel.pro/back --update-env`; затем `pm2 save && pm2 startup`.
- Для первичного входа пробрось порт: `ssh -L 1337:127.0.0.1:1337 ivan@109.73.194.128` и открой `http://localhost:1337/admin`, создай админа через веб-интерфейс.
- В админке включи публичные права: Settings → Users & Permissions → Roles → Public → Case (`find`, `findOne`), сохрани.
- Если права уже включены, проверь Strapi: `pm2 status adel-back`, при необходимости `pm2 restart adel-back`, затем `curl http://127.0.0.1:1337/api/cases?populate=*` должен вернуть 200.
- После настройки nginx и SSL админка откроется по `https://adel.webtm.ru/admin`.

6.  Next.js

- `cd ~/adel.pro/front`, выполни `set +H && set -a && source ../.env && set +a && set -H`.
- Убедись, что в `.env` задан `NEXT_PUBLIC_STRAPI_URL_FALLBACK=http://127.0.0.1:1337`, чтобы сборка не пыталась ходить к домену до настройки nginx.
- Выполни `bun run build`, подними SSR: `PORT=3000 pm2 start --name adel-front "bun run start" --cwd ~/adel.pro/front --update-env`.
- Вернись в корень и обнови список процессов: `cd .. && pm2 save`.

7.  Nginx

- Скопируй апстримы: `sudo tee /etc/nginx/conf.d/adel.upstream.conf >/dev/null < ~/adel.pro/deploy/nginx.upstreams.conf`.
- Заполни виртуальный хост: `sudo tee /etc/nginx/sites-available/adel >/dev/null < ~/adel.pro/deploy/nginx.conf` (или открой `sudo nano` и вставь содержимое файла).
- Включи сайт: `sudo ln -sf /etc/nginx/sites-available/adel /etc/nginx/sites-enabled/adel && sudo rm -f /etc/nginx/sites-enabled/default`.
- Проверь конфиг и перезагрузи: `sudo nginx -t && sudo systemctl reload nginx`.

8.  SSL

- установи `sudo apt update && sudo snap install core && sudo snap refresh core`
- затем поставь сам certbot: `sudo snap install --classic certbot`
- затем сделай ссылку `sudo ln -s /snap/bin/certbot /usr/bin/certbot`
- Выполни `sudo certbot --nginx -d adel.webtm.ru`, включи автоматический редирект на HTTPS и проверь таймер обновления.
- Для проверки продления запусти `sudo certbot renew --dry-run`, затем `sudo certbot certificates`, открой конфиг `sudo nano /etc/nginx/sites-available/adel` и сравни `Certificate Path` и `Private Key Path` с директивами `ssl_certificate` и `ssl_certificate_key`; при расхождении обнови файл, проверь `sudo nginx -t` и перегрузи `sudo systemctl reload nginx`.
- После успешной проверки домена:
- Добавь в `~/adel.pro/.env` строки `STRAPI_PUBLIC_URL=https://adel.webtm.ru`, `STRAPI_ADMIN_URL=https://adel.webtm.ru/admin`, `STRAPI_PROXY=true`.
- Применяй обновлённые переменные: `cd ~/adel.pro/back && set -a && source ../.env && set +a`.
- Пересобери и перезапусти Strapi: `bun run build && pm2 restart adel-back --update-env`.
- Перезапусти фронт с нужным портом: `pm2 stop adel-front && pm2 delete adel-front && PORT=3000 pm2 start --name adel-front "bun run start" --cwd ~/adel.pro/front --update-env && pm2 save`.
- Проверь состояние: `pm2 status`; открой `https://adel.webtm.ru/admin` и убедись, что предупреждения по SSL нет, а Content-Type Builder загружается без ошибок JSON.
- При необходимости сверяй пути до сертификатов: `sudo certbot certificates`; проверяй ответ API командой `curl -k https://adel.webtm.ru/admin/init` — должен вернуться JSON.

9.  Ревалидация

- В Strapi настрой вебхук POST на `https://adel.webtm.ru/api/revalidate` с заголовком `x-webhook-secret` и значением из `.env`.
- Проверь, что `front/src/app/api/revalidate/route.ts` читает секрет из корневого `.env` и вызывает нужные `revalidatePath`.

10. Обслуживание

- Логи и перезапуски: `pm2 logs adel-back`, `pm2 restart adel-front`; обновления: `git pull && bun install && bun run build && pm2 restart all`.
- Бэкапы: настроить cron с `pg_dump adel_back > /var/backups/adel-$(date +%F).sql`, хранить копии вне сервера.
- Мониторинг: `df -h`, `systemctl status nginx`, периодически проверяй срок действия SSL.

### Решение проблем

посмотреть статус сервисов

```

pm2 status

```

```

pm2 logs adel-front --lines 100

```

```

pm2 stop adel-front && pm2 delete adel-front
PORT=3000 pm2 start --name adel-front "bun run start" --cwd ~/adel.pro/front --update-env
pm2 save && pm2 startup

```

```

```
