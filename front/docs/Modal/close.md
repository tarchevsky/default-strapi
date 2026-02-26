# Кнопка закрытия модалки

Сейчас используется картинка **`/close.png`** из `public`, размер кнопки **40×40** px.

## Вернуть стандартную SVG-кнопку

В `src/components/ui/Modal.tsx` заменить блок кнопки закрытия на:

```tsx
					{/* Кнопка закрытия */}
					<button
						onClick={onClose}
						className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
						aria-label='Закрыть'
					>
						<svg
							className='w-6 h-6'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
```

После замены удалить импорт `Image` из `next/image`, если он больше нигде в файле не используется.
