'use client'

import { SearchResultItem } from '@/types/page.types'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type KeyboardEvent,
} from 'react'
import SearchModalShell from './SearchModalShell'

const DEBOUNCE_MS = 300
const STAGGER_CAP = 16
const EASE_OUT = [0.22, 1, 0.36, 1] as const
const EASE_IN = [0.4, 0, 0.2, 1] as const

const SEARCH_HINT =
	'Начните вводить название статьи, страницы или тег — результаты появятся здесь.'

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

const GROUPS: { type: SearchResultItem['type']; label: string }[] = [
	{ type: 'article', label: 'Статьи' },
	{ type: 'page', label: 'Страницы' },
]

interface SearchModalProps {
	open: boolean
	onClose: () => void
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<SearchResultItem[]>([])
	const [loading, setLoading] = useState(false)
	const [activeIndex, setActiveIndex] = useState(-1)
	const inputRef = useRef<HTMLInputElement>(null)
	const router = useRouter()
	const trimmed = query.trim()

	const handleClose = useCallback(() => {
		setQuery('')
		setResults([])
		setActiveIndex(-1)
		onClose()
	}, [onClose])

	// Фокус в поле после открытия (двойной rAF — ждём showModal и анимацию)
	useEffect(() => {
		if (!open) return
		const frame = requestAnimationFrame(() => {
			requestAnimationFrame(() => inputRef.current?.focus())
		})
		return () => cancelAnimationFrame(frame)
	}, [open])

	useEffect(() => {
		if (!trimmed) {
			setResults([])
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
				const data = await res.json()
				setResults(Array.isArray(data) ? data : [])
				setActiveIndex(-1)
			} catch (error) {
				if ((error as Error).name === 'AbortError') return
				setResults([])
			} finally {
				if (!controller.signal.aborted) setLoading(false)
			}
		}, DEBOUNCE_MS)
		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [trimmed])

	// Плоский список в порядке отображения — для навигации стрелками
	const ordered = useMemo(
		() => GROUPS.flatMap(g => results.filter(r => r.type === g.type)),
		[results],
	)

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!ordered.length) return
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			setActiveIndex(i => (i + 1) % ordered.length)
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			setActiveIndex(i => (i <= 0 ? ordered.length - 1 : i - 1))
		} else if (event.key === 'Enter') {
			const item = ordered[activeIndex >= 0 ? activeIndex : 0]
			if (item) {
				event.preventDefault()
				handleClose()
				router.push(item.href)
			}
		}
	}

	const listboxId = 'search-modal-results'
	let rowIndex = 0

	const renderBody = () => {
		if (!trimmed) {
			return <p className='text-lg leading-snug opacity-60'>{SEARCH_HINT}</p>
		}
		if (loading && !results.length) {
			return <p className='text-lg leading-snug opacity-60'>Ищем…</p>
		}
		if (!ordered.length) {
			return <p className='text-lg leading-snug opacity-60'>Ничего не найдено</p>
		}
		return (
			<motion.div
				key={trimmed}
				id={listboxId}
				role='listbox'
				className='flex flex-col gap-8'
				initial='initial'
				animate='animate'
			>
				{GROUPS.map(group => {
					const items = ordered.filter(r => r.type === group.type)
					if (!items.length) return null
					return (
						<div key={group.type} className='flex flex-col gap-2.5'>
							<motion.p
								custom={rowIndex++}
								variants={itemVariants}
								className='text-sm uppercase tracking-wide opacity-60'
							>
								{group.label}
							</motion.p>
							{items.map(item => {
								const index = rowIndex++
								const flatIndex = ordered.indexOf(item)
								const isActive = flatIndex === activeIndex
								return (
									<motion.div
										key={`${item.type}-${item.slug}`}
										custom={index}
										variants={itemVariants}
										className='border-b border-dashed border-base-300 pb-2.5'
									>
										<Link
											id={`${listboxId}-${flatIndex}`}
											href={item.href}
											role='option'
											aria-selected={isActive}
											onClick={handleClose}
											onMouseEnter={() => setActiveIndex(flatIndex)}
											className={`block text-lg leading-snug transition-opacity hover:opacity-70 ${isActive ? 'text-primary' : ''}`}
										>
											{item.title}
										</Link>
									</motion.div>
								)
							})}
						</div>
					)
				})}
			</motion.div>
		)
	}

	return (
		<SearchModalShell open={open} onClose={handleClose} aria-label='Поиск по сайту'>
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
								onChange={e => setQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder='Введите запрос'
								aria-label='Поиск по сайту'
								aria-expanded={ordered.length > 0}
								aria-controls={ordered.length ? listboxId : undefined}
								aria-activedescendant={
									activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
								}
								className='grow text-lg'
							/>
							{query && (
								<button
									type='button'
									onClick={() => {
										setQuery('')
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
