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
- Проверка: `sudo -u postgres psql -c "\l"` — в списке должна быть база `puhovvv`, Owner `crpdu`. Вход: `PGPASSWORD='Mg8nQwR5tY7xZ2pL' psql -h 127.0.0.1 -U crpdu -d puhovvv -c 'SELECT 1;'`

4.  Репозиторий

- Клонируй проект: `git clone git@github.com:tarchevsky/default-strapi.git .`.
- Создай корневой `.env` (единственный по проекту из `deploy/constants.md`) и задай продовые переменные для бэка и фронта; блок публичных URL Strapi оставь пустым до настройки nginx/SSL.
- В `back` и `front` выполни `bun install`; проверь что каталоги `public/uploads` доступны для записи.

5.  Strapi

- `cd ~/puhovvv.ru/back`, выполни `set +H && set -a && source ../.env && set +a && set -H`.
- Собери админку: `bun run build`.
- Зарегистрируй сервис в pm2: `pm2 start --name puhovvv-back "bun run start" --cwd ~/puhovvv.ru/back --update-env`; затем `pm2 save && pm2 startup`.
- Для первичного входа пробрось порт: `ssh -L 1337:127.0.0.1:1337 itdev3@193.233.102.91` и открой `http://localhost:1337/admin`, создай админа через веб-интерфейс.
- В админке включи публичные права: Settings → Users & Permissions → Roles → Public → Case (`find`, `findOne`), сохрани.
- Если права уже включены, проверь Strapi: `pm2 status puhovvv-back`, при необходимости `pm2 restart puhovvv-back`, затем `curl http://127.0.0.1:1337/api/cases?populate=*` должен вернуть 200.
- После настройки nginx и SSL админка откроется по `https://puhovvv.ru/admin`.

6.  Next.js

- `cd ~/puhovvv.ru/front`, выполни `set +H && set -a && source ../.env && set +a && set -H`.
- Убедись, что в `.env` задан `NEXT_PUBLIC_STRAPI_URL_FALLBACK=http://127.0.0.1:1337`, чтобы сборка не пыталась ходить к домену до настройки nginx.
- Выполни `bun run build`, подними SSR: `PORT=3000 pm2 start --name puhovvv-front "bun run start" --cwd ~/puhovvv.ru/front --update-env`.
- Вернись в корень и обнови список процессов: `cd .. && pm2 save`.

7.  Nginx

- Скопируй апстримы: `sudo tee /etc/nginx/conf.d/puhovvv.upstream.conf >/dev/null < ~/puhovvv.ru/deploy/nginx.puhovvv.upstreams.conf`.
- Заполни виртуальный хост: `sudo tee /etc/nginx/sites-available/puhovvv >/dev/null < ~/puhovvv.ru/deploy/nginx.puhovvv.conf` (или открой `sudo nano` и вставь содержимое файла).
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
- Применяй обновлённые переменные: `cd ~/puhovvv.ru/back && set -a && source ../.env && set +a`.
- Пересобери и перезапусти Strapi: `bun run build && pm2 restart puhovvv-back --update-env`.
- Перезапусти фронт с нужным портом: `pm2 stop puhovvv-front && pm2 delete puhovvv-front && PORT=3000 pm2 start --name puhovvv-front "bun run start" --cwd ~/puhovvv.ru/front --update-env && pm2 save`.
- Проверь состояние: `pm2 status`; открой `https://puhovvv.ru/admin` и убедись, что предупреждения по SSL нет, а Content-Type Builder загружается без ошибок JSON.
- При необходимости сверяй пути до сертификатов: `sudo certbot certificates`; проверяй ответ API командой `curl -k https://puhovvv.ru/admin/init` — должен вернуться JSON.

9.  Ревалидация

- В Strapi настрой вебхук POST на `https://puhovvv.ru/api/revalidate` с заголовком `x-webhook-secret` и значением из `.env`.
- Проверь, что `front/src/app/api/revalidate/route.ts` читает секрет из корневого `.env` и вызывает нужные `revalidatePath`.

10. Обслуживание

- Логи и перезапуски: `pm2 logs puhovvv-back`, `pm2 restart puhovvv-front`; обновления: `git pull && bun install && bun run build && pm2 restart all`.
- Бэкапы: настроить cron с `pg_dump puhovvv > /var/backups/puhovvv-$(date +%F).sql`, хранить копии вне сервера.
- Мониторинг: `df -h`, `systemctl status nginx`, периодически проверяй срок действия SSL.

### Решение проблем

посмотреть статус сервисов

```

pm2 status

```

```

pm2 logs puhovvv-front --lines 100

```

```

pm2 stop puhovvv-front && pm2 delete puhovvv-front
PORT=3000 pm2 start --name puhovvv-front "bun run start" --cwd ~/puhovvv.ru/front --update-env
pm2 save && pm2 startup

```

```

```
