## Инструкция по работе с конфигами nginx (upstreams и сайты)

### Как посмотреть текущие конфигурации

1. Посмотреть все конфиги:

   ```sh
   ls /etc/nginx/conf.d/
   ls /etc/nginx/sites-enabled/
   cat /etc/nginx/nginx.conf
   ```

2. Найти upstreams:

   ```sh
   grep -r "upstream" /etc/nginx/
   ```

3. Посмотреть содержимое конкретного конфига:
   ```sh
   cat /etc/nginx/conf.d/имя_конфига.conf
   ```

---

### Как удалить конфигурацию (upstream или сайт)

1. Удалить файл конфига:

   ```sh
   sudo rm /etc/nginx/conf.d/имя_конфига.conf
   sudo rm /etc/nginx/sites-enabled/имя_сайта
   ```

2. Или закомментировать/удалить нужный блок в файле:
   ```sh
   sudo nano /etc/nginx/conf.d/имя_конфига.conf
   ```

---

### Как применить изменения

1. Проверить конфиг на ошибки:

   ```sh
   sudo nginx -t
   ```

2. Перезапустить nginx:
   ```sh
   sudo systemctl reload nginx
   # или
   sudo service nginx reload
   ```

---

## Пример: удалить всё, кроме конкретного сайта - будем называть его notdelete

Допустим, у вас есть такие файлы:

```sh
ls /etc/nginx/conf.d/
notdelete.upstream.conf  siteone.upstream.conf  sitetwo.upstream.conf
ls /etc/nginx/sites-enabled/
notdelete  siteone  sitetwo
```

Чтобы оставить только notdelete:

1. Удалить лишние upstream-конфиги:

   ```sh
   sudo rm /etc/nginx/conf.d/siteone.upstream.conf
   sudo rm /etc/nginx/conf.d/sitetwo.upstream.conf
   ```

2. Удалить лишние сайты:

   ```sh
   sudo rm /etc/nginx/sites-enabled/siteone
   sudo rm /etc/nginx/sites-enabled/sitetwo
   ```

3. Проверить конфиг:

   ```sh
   sudo nginx -t
   ```

4. Применить изменения:
   ```sh
   sudo systemctl reload nginx
   # или
   sudo service nginx reload
   ```

После этого на сервере останутся только конфиги и upstreams для notdelete, остальные больше не будут действовать.
