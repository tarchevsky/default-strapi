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

		setItems(mapped)
	}, [containerId])

	if (items.length === 0) return null

	const handleClick = (el: HTMLElement) => {
		el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
							className='cursor-pointer text-left hover:text-gray-700'
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
