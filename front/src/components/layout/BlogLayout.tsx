'use client'

import SearchInput from '@/components/SearchInput'
import BarLinkList from '@/components/BarLinkList'
import { getArticleHref } from '@/services/page.service'
import { ArticleListItem, PAGE_CATEGORIES } from '@/types/page.types'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

const ALL_CATEGORIES = '' as const
const ALL_SERIES = '' as const

export interface SeriesOption {
	seriesSlug: string
	name: string
}

interface BlogLayoutProps {
	children: ReactNode
	/** Список статей для селекта категории/серии и вывода в контенте */
	articles?: ArticleListItem[]
	/** Список серий для фильтра в сайдбаре */
	seriesList?: SeriesOption[]
}

/** Палитра для тегов: у каждого тега свой цвет по индексу */
const TAG_PALETTE = [
	{ unselected: 'border-sky-300 bg-sky-100 hover:bg-sky-200', selected: 'border-sky-600 bg-sky-600 text-white' },
	{ unselected: 'border-emerald-300 bg-emerald-100 hover:bg-emerald-200', selected: 'border-emerald-600 bg-emerald-600 text-white' },
	{ unselected: 'border-amber-300 bg-amber-100 hover:bg-amber-200', selected: 'border-amber-600 bg-amber-600 text-white' },
	{ unselected: 'border-violet-300 bg-violet-100 hover:bg-violet-200', selected: 'border-violet-600 bg-violet-600 text-white' },
	{ unselected: 'border-rose-300 bg-rose-100 hover:bg-rose-200', selected: 'border-rose-600 bg-rose-600 text-white' },
	{ unselected: 'border-teal-300 bg-teal-100 hover:bg-teal-200', selected: 'border-teal-600 bg-teal-600 text-white' },
	{ unselected: 'border-orange-300 bg-orange-100 hover:bg-orange-200', selected: 'border-orange-600 bg-orange-600 text-white' },
	{ unselected: 'border-indigo-300 bg-indigo-100 hover:bg-indigo-200', selected: 'border-indigo-600 bg-indigo-600 text-white' },
] as const

const overlayTransition = { duration: 0.2 }
const panelTransition = {
	duration: 0.25,
	ease: [0.32, 0.72, 0, 1] as const,
}

/** Лейаут для типа страницы «блог»: контент + сайдбар с селектом категорий и списком статей. */
export default function BlogLayout({
	children,
	articles = [],
	seriesList = [],
}: BlogLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [category, setCategory] = useState<string>(ALL_CATEGORIES)
	const [series, setSeries] = useState<string>(ALL_SERIES)
	const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

	const articlesByCategory =
		category === ALL_CATEGORIES
			? articles
			: articles.filter(a => a.category === category)
	const seriesSlugsInCategory = new Set(
		articlesByCategory.map(a => a.seriesSlug).filter(Boolean),
	)
	const seriesListForCategory = seriesList.filter(s =>
		seriesSlugsInCategory.has(s.seriesSlug),
	)
	const effectiveSeries =
		series === ALL_SERIES || seriesListForCategory.some(s => s.seriesSlug === series)
			? series
			: ALL_SERIES

	const articlesByCategoryAndSeries =
		effectiveSeries === ALL_SERIES
			? articlesByCategory
			: articlesByCategory.filter(a => a.seriesSlug === effectiveSeries)
	const tagList = [
		...new Set(
			articlesByCategoryAndSeries.flatMap(a => a.tags ?? []).filter(Boolean),
		),
	].sort()
	const effectiveSelectedTags = [...selectedTags].filter(t => tagList.includes(t))

	const toggleTag = (t: string) => {
		setSelectedTags(prev => {
			const next = new Set(prev)
			if (next.has(t)) next.delete(t)
			else next.add(t)
			return next
		})
	}

	const filtered = articles
		.filter(a => category === ALL_CATEGORIES || a.category === category)
		.filter(a => effectiveSeries === ALL_SERIES || a.seriesSlug === effectiveSeries)
		.filter(
			a =>
				effectiveSelectedTags.length === 0 ||
				(a.tags &&
					effectiveSelectedTags.every(tag => a.tags!.includes(tag))),
		)

	const hasSidebar = articles.length > 0
	const hasSeriesFilter = seriesListForCategory.length > 0
	const hasTagsFilter = tagList.length > 0
	const hasActiveFilters =
		category !== ALL_CATEGORIES ||
		effectiveSeries !== ALL_SERIES ||
		effectiveSelectedTags.length > 0

	const resetFilters = () => {
		setCategory(ALL_CATEGORIES)
		setSeries(ALL_SERIES)
		setSelectedTags(new Set())
	}

	const sidebarContent = hasSidebar && (
		<div className='cont cont-left space-y-4'>
			<div>
				<label className='label py-1'>
					<span className='label-text font-medium md:mt-5 md:mb-5'>
						Категория
					</span>
				</label>
				<select
					className='select select-bordered w-full'
					value={category}
					onChange={e => setCategory(e.target.value)}
					aria-label='Выбор категории статей'
				>
					<option value={ALL_CATEGORIES}>Все</option>
					{PAGE_CATEGORIES.map(cat => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>
			</div>
			{hasSeriesFilter && (
				<div>
					<label className='label py-1'>
						<span className='label-text font-medium md:mb-5'>Серии</span>
					</label>
					<select
						className='select select-bordered w-full'
						value={effectiveSeries}
						onChange={e => setSeries(e.target.value)}
						aria-label='Выбор серии статей'
					>
						<option value={ALL_SERIES}>Все</option>
						{seriesListForCategory.map(s => (
							<option key={s.seriesSlug} value={s.seriesSlug}>
								{s.name}
							</option>
						))}
					</select>
				</div>
			)}
			{hasTagsFilter && (
				<div>
					<span className='label-text font-medium md:mt-5 md:mb-5 block'>
						Теги
					</span>
					<div className='flex flex-wrap gap-2' role='group' aria-label='Фильтр по тегам'>
						{tagList.map((t, i) => {
							const palette = TAG_PALETTE[i % TAG_PALETTE.length]
							const isSelected = effectiveSelectedTags.includes(t)
							return (
								<button
									key={t}
									type='button'
									onClick={() => toggleTag(t)}
									className={`cursor-pointer select-none rounded-md border px-3 py-1.5 text-sm transition-colors ${
										isSelected ? palette.selected : palette.unselected
									}`}
								>
									{t}
								</button>
							)
						})}
					</div>
				</div>
			)}
			{hasActiveFilters && (
				<button
					type='button'
					onClick={resetFilters}
					className='cursor-pointer text-sm text-base-content/70 hover:text-base-content hover:underline'
				>
					Сброс фильтров
				</button>
			)}
		</div>
	)

	return (
		<div className='cont md:mt-14'>
			{/* Мобиле: кнопка над статьёй */}
			{hasSidebar && (
				<div className='mb-4 flex items-center gap-2 lg:hidden'>
					<button
						type='button'
						onClick={() => setSidebarOpen(true)}
						className='btn btn-sm btn-outline shrink-0'
						aria-expanded={sidebarOpen}
						aria-controls='blog-sidebar-overlay'
					>
						Категории
					</button>
					<div className='min-w-0 flex-1'>
						<SearchInput
							inputClassName='input input-bordered input-sm h-9 w-full rounded-full pr-10 placeholder:opacity-60 border border-base-300 md:h-10'
							aria-label='Поиск'
						/>
					</div>
				</div>
			)}

			{/* Оверлей: сайдбар по центру экрана (мобиле), плавное открытие/закрытие */}
			<AnimatePresence mode='wait'>
				{hasSidebar && sidebarOpen && (
					<motion.div
						key='blog-sidebar-overlay'
						id='blog-sidebar-overlay'
						className='fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden'
						aria-modal='true'
						role='dialog'
						aria-label='Боковая панель'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={overlayTransition}
					>
						<motion.button
							type='button'
							className='absolute inset-0 bg-black/50'
							onClick={() => setSidebarOpen(false)}
							aria-label='Закрыть'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={overlayTransition}
						/>
						<motion.div
							className='relative cont max-h-[85vh] w-full max-w-sm overflow-auto rounded-lg bg-base-100 p-4 pt-10 pb-10 shadow-xl'
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={panelTransition}
							onClick={e => e.stopPropagation()}
						>
							<button
								type='button'
								className='btn btn-circle btn-ghost btn-sm absolute right-2 top-2 z-10 min-h-10 min-w-10 touch-manipulation'
								onClick={() => setSidebarOpen(false)}
								aria-label='Закрыть'
							>
								✕
							</button>
							{sidebarContent}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className='flex flex-col gap-8 lg:flex-row lg:gap-10'>
				<main className='min-w-0 flex-1'>
					{children}
					{hasSidebar && (
						<section className='mt-10' aria-label='Статьи'>
							{filtered.length > 0 ? (
								<BarLinkList
									items={filtered.map(article => ({
										href: getArticleHref(article),
										name: article.title,
									}))}
								/>
							) : (
								<p className=' text-sm opacity-80'>
									Пока нет статей по выбранным фильтрам
								</p>
							)}
						</section>
					)}
				</main>
				{hasSidebar && (
					<aside
						className='hidden h-[75vh] w-full shrink-0 overflow-auto border-l-2 border-solid border-gray-200 lg:sticky lg:top-0 lg:block lg:w-72 lg:pt-0'
						aria-label='Боковая панель'
					>
						{sidebarContent}
					</aside>
				)}
			</div>
		</div>
	)
}
