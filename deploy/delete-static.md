# Очистка статики в случае ошибок сборки

```shell
cd ~/dom/front
```

```shell
rm -rf ~/dom/front/.next
```

```shell
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 stop dom-front
pm2 delete dom-front
PORT=3000 pm2 start --name dom-front "bun run start" --cwd ~/dom/front --update-env
pm2 save && pm2 startup
```
