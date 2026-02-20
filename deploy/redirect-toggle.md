# Быстрое переключение редиректа cosmeya.art → cosmeya.vercel.app

## Включить редирект на Vercel

```bash
# 1. Загрузить конфиг редиректа на сервер
scp ~/cosmeya.art/deploy/nginx.cosmeya.conf.redirect ivan@109.73.194.128:~/cosmeya.art/deploy/

# 2. На сервере применить редирект
ssh ivan@109.73.194.128
sudo cp /etc/nginx/sites-available/cosmeya /etc/nginx/sites-available/cosmeya.working
sudo tee /etc/nginx/sites-available/cosmeya >/dev/null < ~/cosmeya.art/deploy/nginx.cosmeya.conf.redirect
sudo nginx -t && sudo systemctl reload nginx
```

После этого все запросы к `cosmeya.art` будут временно (302) редиректиться на `cosmeya.vercel.app`.

## Вернуть обратно на свой сервер

```bash
ssh ivan@109.73.194.128
sudo cp /etc/nginx/sites-available/cosmeya.working /etc/nginx/sites-available/cosmeya
sudo nginx -t && sudo systemctl reload nginx
```

## Альтернатива: одной командой

### Включить редирект:
```bash
ssh ivan@109.73.194.128 "sudo cp /etc/nginx/sites-available/cosmeya /etc/nginx/sites-available/cosmeya.working && sudo tee /etc/nginx/sites-available/cosmeya >/dev/null < ~/cosmeya.art/deploy/nginx.cosmeya.conf.redirect && sudo nginx -t && sudo systemctl reload nginx"
```

### Вернуть обратно:
```bash
ssh ivan@109.73.194.128 "sudo cp /etc/nginx/sites-available/cosmeya.working /etc/nginx/sites-available/cosmeya && sudo nginx -t && sudo systemctl reload nginx"
```

## Примечания

- Используется **302 редирект** (временный), а не 301 (постоянный)
- Сохраняется `$request_uri` — все пути переносятся на Vercel
- SSL сертификаты остаются на месте
- PM2 процессы (`cosmeya-front`, `cosmeya-back`) продолжают работать, просто не получают трафик
- Можно остановить процессы для экономии ресурсов: `pm2 stop cosmeya-front cosmeya-back`
- Для возврата: `pm2 start cosmeya-front cosmeya-back`
