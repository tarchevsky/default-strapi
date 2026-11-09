'use client'

import { getArticleHref } from '@/services/page.service'
import type { ArticleListItem } from '@/types/page.types'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { getSeriesHref } from './ui/card/ArticleCard'

interface FavoritePostsProps {
	articles: ArticleListItem[]
	title?: string
}

function FavoriteCard({ article }: { article: ArticleListItem }) {
	const href = getArticleHref(article)
	const seriesHref = getSeriesHref(article)
	const seriesName = article.seriesName?.trim() || article.seriesSlug

	return (
		<article className='group relative flex flex-col flex-shrink-0 snap-start w-[280px] md:w-[380px] overflow-hidden rounded-2xl bg-base-100 shadow-sm ring-1 ring-base-content/10 p-5 md:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-accent/60'>
			<span
				aria-hidden
				className='absolute inset-x-0 top-0 h-1 bg-accent'
			/>
			<Link
				href={href}
				aria-label={article.title}
				className='absolute inset-0 z-0 rounded-2xl'
			/>
			<div className='flex items-center gap-2 text-xs uppercase tracking-widest opacity-70'>
				<Star className='w-4 h-4 text-accent fill-accent' aria-hidden />
				<span>{article.category ?? 'Избранное'}</span>
			</div>
			<h3 className='mt-3 text-lg md:text-xl font-bold leading-snug line-clamp-3'>
				{article.title}
			</h3>
			{article.description ? (
				<p className='mt-3 text-sm opacity-80 line-clamp-3'>
					{article.description}
				</p>
			) : null}
			<div className='mt-auto pt-4 h-10 flex items-end min-w-0'>
				{seriesHref && seriesName ? (
					<Link
						href={seriesHref}
						className='relative z-10 max-w-full truncate rounded-full border border-base-content/15 px-3 py-1 text-xs hover:border-accent hover:text-accent transition-colors'
					>
						Серия: {seriesName}
					</Link>
				) : null}
			</div>
		</article>
	)
}

const arrowClass =
	'btn btn-circle btn-sm btn-ghost border border-base-content/15 hover:border-accent hover:text-accent'

/** Блок избранных статей (отмеченных полем Favorite) — карусель крупных карточек со стрелками. */
export function FavoritePosts({
	articles,
	title = 'Избранные статьи',
}: FavoritePostsProps) {
	const scrollerRef = useRef<HTMLDivElement>(null)
	if (!articles.length) return null

	const scrollBy = (dir: 1 | -1) => {
		const el = scrollerRef.current
		if (!el) return
		el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
	}

	return (
		<section className='not-prose my-6 md:my-10'>
			<div className='cont flex items-center justify-between gap-4 mb-3 md:mb-4'>
				<h2 className='text-xl md:text-2xl font-bold'>{title}</h2>
				{articles.length > 1 && (
					<div className='hidden md:flex gap-2'>
						<button
							type='button'
							aria-label='Назад'
							className={arrowClass}
							onClick={() => scrollBy(-1)}
						>
							<ChevronLeft className='w-4 h-4' />
						</button>
						<button
							type='button'
							aria-label='Вперёд'
							className={arrowClass}
							onClick={() => scrollBy(1)}
						>
							<ChevronRight className='w-4 h-4' />
						</button>
					</div>
				)}
			</div>
			<div
				ref={scrollerRef}
				className='w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-px-[var(--cont-xs)] md:scroll-px-[var(--cont-sm)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
			>
				<div className='flex items-stretch gap-5 md:gap-6 py-3 px-[var(--cont-xs)] md:px-[var(--cont-sm)] min-w-max'>
					{articles.map(a => (
						<FavoriteCard
							key={`${a.categorySlug ?? ''}-${a.seriesSlug ?? ''}-${a.slug}`}
							article={a}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
