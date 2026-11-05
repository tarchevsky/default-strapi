'use client'

import {
	EMPTY_SEARCH_RESPONSE,
	type SearchResponse,
} from '@/types/search.types'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode,
} from 'react'
import SearchModalShell from './SearchModalShell'
import { searchStore, useSearchState } from './searchStore'

const DEBOUNCE_MS = 250
const listboxId = 'search-modal-results'
const STAGGER_CAP = 16
const EASE_OUT = [0.22, 1, 0.36, 1] as const
const EASE_IN = [0.4, 0, 0.2, 1] as const

const SEARCH_HINT =
	'Ищем по всему сайту: заголовкам и тексту статей, сериям, тегам и страницам. Начните вводить запрос.'

const contentVariants: Variants = {
	initial: {},
	animate: { transition: { staggerChildren: 0.035, delayChildren: 0.06 } },
	exit: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
}

const itemVariants: Variants = {
	initial: { opacity: 0, y: -10 },
	animate: (index: number = 0) => ({
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.28,
			ease: EASE_OUT,
			delay: Math.min(index, STAGGER_CAP) * 0.035,
		},
	}),
	exit: { opacity: 0, y: -14, transition: { duration: 0.16, ease: EASE_IN } },
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Подсветка слов запроса (без учёта регистра и ё/е) */
const highlight = (text: string, query: string): ReactNode => {
	const words = query
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map(w => escapeRegExp(w).replace(/[её]/gi, '[её]'))
	if (!words.length || !text) return text
	const re = new RegExp(`(${words.join('|')})`, 'gi')
	return text.split(re).map((part, i) =>
		i % 2 === 1 ? (
			<mark key={i} className='rounded-sm bg-primary/25 text-inherit'>
				{part}
			</mark>
		) : (
			<Fragment key={i}>{part}</Fragment>
		),
	)
}

/** Элемент результата в общем плоском списке (для навигации стрелками) */
interface ResultLink {
	key: string
	href: string
	title: string
	subtitle?: string
	meta?: string
}

interface ResultSection {
	id: string
	label: string
	/** Для тегов: подзаголовки групп внутри раздела */
	groups: { heading?: string; links: ResultLink[] }[]
}

const buildSections = (data: SearchResponse): ResultSection[] => {
	const sections: ResultSection[] = [
		{
			id: 'articles',
			label: 'Статьи',
			groups: [
				{
					links: data.articles.map(a => ({
						key: `a-${a.href}`,
						href: a.href,
						title: a.title,
						subtitle: a.description,
					})),
				},
			],
		},
		{
			id: 'texts',
			label: 'Текст в статьях',
			groups: [
				{
					links: data.texts.map(t => ({
						key: `t-${t.href}`,
						href: t.href,
						title: t.title,
						subtitle: t.snippet,
					})),
				},
			],
		},
		{
			id: 'series',
			label: 'Серии статей',
			groups: [
				{
					links: data.series.map(s => ({
						key: `s-${s.href}`,
						href: s.href,
						title: s.name,
						subtitle: s.description,
						meta: `${s.count} ${pluralArticles(s.count)}`,
					})),
				},
			],
		},
		{
			id: 'tags',
			label: 'Теги',
			groups: data.tags.map(tag => ({
				heading: `#${tag.name}`,
				links: tag.articles.map(a => ({
					key: `g-${tag.name}-${a.href}`,
					href: a.href,
					title: a.title,
				})),
			})),
		},
		{
			id: 'pages',
			label: 'Страницы',
			groups: [
				{
					links: data.pages.map(p => ({
						key: `p-${p.href}`,
						href: p.href,
						title: p.title,
						subtitle: p.description,
					})),
				},
			],
		},
	]
	// Пустые разделы не показываем
	return sections.filter(s => s.groups.some(g => g.links.length > 0))
}

function pluralArticles(n: number) {
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 === 1 && mod100 !== 11) return 'статья'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'статьи'
	return 'статей'
}

export default function SearchModal() {
	const { open, query } = useSearchState()
	const [data, setData] = useState<SearchResponse>(EMPTY_SEARCH_RESPONSE)
	const [resultQuery, setResultQuery] = useState('')
	const [loading, setLoading] = useState(false)
	const [activeIndex, setActiveIndex] = useState(-1)
	const inputRef = useRef<HTMLInputElement>(null)
	const router = useRouter()
	const trimmed = query.trim()

	const handleClose = useCallback(() => searchStore.close(), [])

	useEffect(() => {
		if (!trimmed) {
			setData(EMPTY_SEARCH_RESPONSE)
			setResultQuery('')
			setLoading(false)
			return
		}
		const controller = new AbortController()
		setLoading(true)
		const timer = setTimeout(async () => {
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
					signal: controller.signal,
				})
				const json = (await res.json()) as Partial<SearchResponse>
				setData({ ...EMPTY_SEARCH_RESPONSE, ...json })
				setResultQuery(trimmed)
				setActiveIndex(-1)
			} catch (error) {
				if ((error as Error).name === 'AbortError') return
				setData(EMPTY_SEARCH_RESPONSE)
				setResultQuery(trimmed)
			} finally {
				if (!controller.signal.aborted) setLoading(false)
			}
		}, DEBOUNCE_MS)
		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [trimmed])

	const sections = useMemo(() => buildSections(data), [data])
	const flatLinks = useMemo(
		() => sections.flatMap(s => s.groups.flatMap(g => g.links)),
		[sections],
	)

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!flatLinks.length) return
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			setActiveIndex(i => (i + 1) % flatLinks.length)
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			setActiveIndex(i => (i <= 0 ? flatLinks.length - 1 : i - 1))
		} else if (event.key === 'Enter') {
			const item = flatLinks[activeIndex >= 0 ? activeIndex : 0]
			if (item) {
				event.preventDefault()
				handleClose()
				router.push(item.href)
			}
		}
	}

	// Активный пункт держим в зоне видимости при навигации стрелками
	useEffect(() => {
		if (activeIndex < 0) return
		document
			.getElementById(`${listboxId}-${activeIndex}`)
			?.scrollIntoView({ block: 'nearest' })
	}, [activeIndex])


	const renderBody = () => {
		if (!trimmed) {
			return <p className='text-lg leading-snug opacity-60'>{SEARCH_HINT}</p>
		}
		if (!resultQuery || (loading && !flatLinks.length)) {
			return <p className='text-lg leading-snug opacity-60'>Ищем…</p>
		}
		if (!sections.length) {
			return <p className='text-lg leading-snug opacity-60'>Ничего не найдено</p>
		}

		let rowIndex = 0
		let linkIndex = 0
		return (
			<motion.div
				key={resultQuery}
				id={listboxId}
				role='listbox'
				className={`flex flex-col gap-8 transition-opacity ${loading ? 'opacity-60' : ''}`}
				initial='initial'
				animate='animate'
			>
				{sections.map(section => (
					<section key={section.id} className='flex flex-col gap-2.5'>
						<motion.p
							custom={rowIndex++}
							variants={itemVariants}
							className='font-sans text-sm font-normal uppercase tracking-wide opacity-60'
						>
							{section.label}
						</motion.p>
						{section.groups.map((group, gi) => (
							<div key={group.heading ?? gi} className='flex flex-col gap-2.5'>
								{group.heading && (
									<motion.p
										custom={rowIndex++}
										variants={itemVariants}
										className='mt-1 text-base font-semibold text-primary'
									>
										{highlight(group.heading, resultQuery)}
									</motion.p>
								)}
								{group.links.map(link => {
									const index = linkIndex++
									const isActive = index === activeIndex
									return (
										<motion.div
											key={link.key}
											custom={rowIndex++}
											variants={itemVariants}
											className='border-b border-dashed border-base-300 pb-2.5'
										>
											<Link
												id={`${listboxId}-${index}`}
												href={link.href}
												role='option'
												aria-selected={isActive}
												onClick={handleClose}
												onMouseEnter={() => setActiveIndex(index)}
												className='group block'
											>
												<span
													className={`flex items-baseline justify-between gap-3 text-lg leading-snug transition-colors ${isActive ? 'text-primary' : ''}`}
												>
													<span className='min-w-0'>
														{highlight(link.title, resultQuery)}
													</span>
													{link.meta && (
														<span className='shrink-0 text-sm opacity-60'>
															{link.meta}
														</span>
													)}
												</span>
												{link.subtitle && (
													<span className='mt-1 block text-sm leading-snug opacity-70 line-clamp-3'>
														{highlight(link.subtitle, resultQuery)}
													</span>
												)}
											</Link>
										</motion.div>
									)
								})}
							</div>
						))}
					</section>
				))}
			</motion.div>
		)
	}

	return (
		<SearchModalShell
			open={open}
			onClose={handleClose}
			aria-label='Поиск по сайту'
			initialFocusRef={inputRef}
		>
			<AnimatePresence mode='wait'>
				{open ? (
					<motion.div
						key='search-modal-content'
						className='flex h-full min-h-0 flex-col'
						variants={contentVariants}
						initial='initial'
						animate='animate'
						exit='exit'
					>
						<motion.label
							custom={0}
							variants={itemVariants}
							className='input input-lg flex w-full items-center gap-3 rounded-full border border-base-300'
						>
							<Search className='size-5 shrink-0 opacity-70' aria-hidden />
							<input
								ref={inputRef}
								type='text'
								role='combobox'
								autoComplete='off'
								value={query}
								onChange={e => searchStore.setQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder='Введите запрос'
								aria-label='Поиск по сайту'
								aria-expanded={flatLinks.length > 0}
								aria-controls={flatLinks.length ? listboxId : undefined}
								aria-activedescendant={
									activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
								}
								className='grow text-lg'
							/>
							{query && (
								<button
									type='button'
									onClick={() => {
										searchStore.setQuery('')
										inputRef.current?.focus()
									}}
									className='shrink-0 transition-opacity hover:opacity-70'
									aria-label='Очистить поиск'
								>
									<X className='size-5' />
								</button>
							)}
						</motion.label>

						<motion.div
							custom={1}
							variants={itemVariants}
							className='mt-8 min-h-0 flex-1 overflow-y-auto px-1'
						>
							{renderBody()}
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</SearchModalShell>
	)
}
