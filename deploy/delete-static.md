# Очистка статики в случае ошибок сборки

```shell
cd ~/puhovvv.ru/front
```

```shell
rm -rf ~/puhovvv.ru/front/.next
```

```shell
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 stop puhovvv-front
pm2 delete puhovvv-front
PORT=3000 pm2 start --name puhovvv-front "bun run start" --cwd ~/puhovvv.ru/front --update-env
pm2 save && pm2 startup
```
