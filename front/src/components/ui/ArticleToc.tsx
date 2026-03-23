'use client'

import { useEffect, useState } from 'react'

interface TocItem {
	text: string
	level: number
	element: HTMLElement
}

interface ArticleTocProps {
	containerId: string
}

const ArticleToc = ({ containerId }: ArticleTocProps) => {
	const [items, setItems] = useState<TocItem[]>([])
	const [activeIndex, setActiveIndex] = useState<number | null>(null)

	useEffect(() => {
		const container = document.getElementById(containerId)
		if (!container) return

		const headings = Array.from(
			container.querySelectorAll<HTMLElement>('h2, h3, h4'),
		)

		const mapped = headings
			.map(h => {
				const level = Number(h.tagName.replace('H', ''))
				const text = h.textContent?.trim() ?? ''
				if (!text) return null
				return { text, level, element: h }
			})
			.filter((x): x is TocItem => x !== null)

		setActiveIndex(null)
		setItems(mapped)
	}, [containerId])

	useEffect(() => {
		if (items.length === 0) return

		const elementToIndex = new Map<HTMLElement, number>(
			items.map((item, idx) => [item.element, idx]),
		)

		// Смещаем “активность” ближе к верху экрана, чтобы подсветка обновлялась
		// до смены контента (с учётом sticky-меню).
		const topOffsetPx = 140

		const observer = new IntersectionObserver(
			entries => {
				let bestIdx: number | null = null
				let bestScore = Number.POSITIVE_INFINITY

				for (const entry of entries) {
					if (!entry.isIntersecting) continue
					const el = entry.target as HTMLElement
					const idx = elementToIndex.get(el)
					if (idx === undefined) continue

					// Выбираем тот заголовок, который ближе всего к области “активности”.
					const score = Math.abs(entry.boundingClientRect.top - topOffsetPx)
					if (score < bestScore) {
						bestScore = score
						bestIdx = idx
					}
				}

				if (bestIdx !== null) setActiveIndex(bestIdx)
			},
			{
				// Когда заголовок попадает в верхнюю часть viewport — он считается активным.
				rootMargin: '-20% 0px -65% 0px',
				threshold: [0, 0.1, 0.25, 0.5],
			},
		)

		for (const item of items) observer.observe(item.element)

		return () => observer.disconnect()
	}, [items])

	if (items.length === 0) return null

	const handleClick = (el: HTMLElement) => {
		el.scrollIntoView({ behavior: 'smooth', block: 'start' })
		const idx = items.findIndex(i => i.element === el)
		if (idx >= 0) setActiveIndex(idx)
	}

	return (
		<nav
			aria-label='Оглавление статьи'
			className='pointer-events-auto hidden lg:block lg:sticky lg:top-32 lg:self-start w-52 max-h-[calc(100vh-8rem)] overflow-auto text-xs text-gray-500'
		>
			<div className='mb-2 tracking-wide text-gray-400'>Оглавление</div>
			<ul className='space-y-1 list-none pl-0'>
				{items.map((item, index) => (
					<li
						key={`${item.text}-${index}`}
						className={
							item.level === 3 ? 'pl-3' : item.level >= 4 ? 'pl-5' : ''
						}
					>
						<button
							type='button'
							className={`cursor-pointer text-left hover:text-gray-700 ${
								activeIndex === index ? 'text-gray-900 font-medium' : ''
							}`}
							onClick={() => handleClick(item.element)}
						>
							{item.text}
						</button>
					</li>
				))}
			</ul>
		</nav>
	)
}

export default ArticleToc
