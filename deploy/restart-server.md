# back

- `cd ~/adel.pro/back`, выполни `set +H && set -a && source ../.env && set +a && set -H`.
- Собери админку: `bun run build`.
- Зарегистрируй сервис в pm2: `pm2 start --name adel-back "bun run start" --cwd ~/adel.pro/back --update-env`; затем `pm2 save && pm2 startup`.

# front

- `cd ~/adel.pro/front`, выполни `set +H && set -a && source ../.env && set +a && set -H`
- Выполни `bun run build`, подними SSR: `PORT=3000 pm2 start --name adel-front "bun run start" --cwd ~/adel.pro/front --update-env`.
- `pm2 save && pm2 startup`

# перезапуск сервера

```
sudo systemctl reload nginx
```

# автозапуск после перезагрузки (один раз)

## системные сервисы

```sh
sudo systemctl enable nginx
sudo systemctl enable postgresql
```

## PM2-процессы

Процессы: `adel-back` и `adel-front`.

```sh
# с учётом Bun в PATH
sudo env "PATH=$PATH:$HOME/.bun/bin" pm2 startup systemd -u $USER --hp $HOME
pm2 save
# опционально: автосейв дампа процессов
pm2 set pm2:autodump true
```

Проверка после ребута:

```sh
sudo reboot
# после входа
pm2 status
systemctl status pm2-$USER
```

Если не поднялось автоматически:

```sh
pm2 resurrect
pm2 status
```

# дубли процессов

```
pm2 stop adel-front
```

```
pm2 delete adel-front
```
