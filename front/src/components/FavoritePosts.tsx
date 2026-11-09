import { getArticleHref } from '@/services/page.service'
import type { ArticleListItem } from '@/types/page.types'
import { Star } from 'lucide-react'
import Link from 'next/link'
import { getSeriesHref } from './ui/card/ArticleCard'
import { SectionTitle } from './ui/SectionTitle'

interface FavoritePostsProps {
	articles: ArticleListItem[]
	title?: string
}

function FavoriteCard({ article }: { article: ArticleListItem }) {
	const href = getArticleHref(article)
	const seriesHref = getSeriesHref(article)
	const seriesName = article.seriesName?.trim() || article.seriesSlug

	return (
		<article className='group relative flex flex-col h-full overflow-hidden rounded-2xl bg-base-100 shadow-sm ring-1 ring-base-content/10 p-5 md:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-accent/60'>
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

/** Блок избранных статей (отмеченных полем Favorite) — сетка карточек. */
export function FavoritePosts({
	articles,
	title = 'Избранные статьи',
}: FavoritePostsProps) {
	if (!articles.length) return null

	return (
		<section className='not-prose my-6 md:my-10'>
			<SectionTitle>{title}</SectionTitle>
			<div className='cont grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{articles.map(a => (
					<FavoriteCard
						key={`${a.categorySlug ?? ''}-${a.seriesSlug ?? ''}-${a.slug}`}
						article={a}
					/>
				))}
			</div>
		</section>
	)
}
