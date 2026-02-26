# Стрелки карусели кейсов

Карусель использует либо кастомные картинки стрелок, либо стандартные стрелки Swiper.

## Текущий режим

Задаётся в `src/constants/carousel.constant.ts`:

- **`USE_CUSTOM_CAROUSEL_ARROWS = true`** — стрелки из `/public/arrow-next.png` и `/public/arrow-prev.png` (размер 38×212 px).
- **`USE_CUSTOM_CAROUSEL_ARROWS = false`** — стандартные стрелки Swiper (как было изначально).

## Как вернуть прежние стрелки

В файле `front/src/constants/carousel.constant.ts` измените:

```ts
export const USE_CUSTOM_CAROUSEL_ARROWS = false
```

Сохраните файл — карусель снова будет использовать встроенные стрелки Swiper.
