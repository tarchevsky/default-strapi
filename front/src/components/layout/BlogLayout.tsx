'use client'

import SearchInput from '@/components/SearchInput'
import { ArticleListItem, PAGE_CATEGORIES } from '@/types/page.types'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

const ALL_CATEGORIES = '' as const

interface BlogLayoutProps {
	children: ReactNode
	/** Список статей для селекта категории и вывода в контенте */
	articles?: ArticleListItem[]
}

const overlayTransition = { duration: 0.2 }
const panelTransition = {
	duration: 0.25,
	ease: [0.32, 0.72, 0, 1] as const,
}

/** Лейаут для типа страницы «блог»: контент + сайдбар с селектом категорий и списком статей. */
export default function BlogLayout({
	children,
	articles = [],
}: BlogLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [category, setCategory] = useState<string>(ALL_CATEGORIES)

	const filtered =
		category === ALL_CATEGORIES
			? articles
			: articles.filter(a => a.category === category)

	const hasSidebar = articles.length > 0
	const sidebarContent = hasSidebar && (
		<div className='cont cont-left'>
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
							className='relative cont max-h-[85vh] w-full max-w-sm overflow-auto rounded-lg bg-base-100 p-4 pt-10 shadow-xl'
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
								<ul className='list-none space-y-2'>
									{filtered.map(article => (
										<li key={article.slug}>
											<Link
												href={
													article.categorySlug
														? `/blog/${article.categorySlug}/${article.slug}`
														: `/${article.slug}`
												}
												className='link link-hover block'
											>
												{article.title}
											</Link>
										</li>
									))}
								</ul>
							) : (
								<p className=' text-sm opacity-80'>
									Пока в выбранной категории статей нет
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
