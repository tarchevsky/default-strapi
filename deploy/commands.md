## Обновить strapi после изменений

### коротко

```shell
cd ~/site/back
bun run build
pm2 restart site-back
```

### полноценно

```shell
cd ~/site/back
set +H && set -a && source ../.env && set +a && set -H
bun run build
pm2 restart site-back --update-env
pm2 save
```

### Проверить статус

```shell
pm2 status site-back
pm2 logs site-back --lines 50
```

## Узнать сохраненные команды

- узнать список сохраненных процессов

```shell
pm2 list
```

- детальная информацияю о конкретном процессе

```shell
pm2 info site-front
```

- где хранятся конфиги

```
cat ~/.pm2/dump.pm2
cat ~/.pm2/conf.js
```

Когда ты делаешь pm2 restart site-back, PM2:

Останавливает текущий процесс
Запускает снова bun run start в той же папке
Если ты хочешь, чтобы PM2 автоматически перепулил код перед стартом, нужно использовать ecosystem file (например, ecosystem.config.js), где можно добавить хук:

```ts
module.exports = {
	apps: [
		{
			name: 'site-back',
			script: 'bun',
			args: 'run start',
			cwd: '/home/ivan/site/back',
			pre_restart: 'git -C /home/ivan/site pull', // Перед рестартом пулит код из корня репозитория
		},
	],
}
```
