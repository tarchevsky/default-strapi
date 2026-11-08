import { getArticleHref } from '@/services/page.service'
import type { ArticleListItem } from '@/types/page.types'
import Link from 'next/link'

interface ArticleCardProps {
	article: ArticleListItem
}

/** Ссылка на страницу серии: /blog/[category]/series/[seriesSlug] */
const getSeriesHref = (a: ArticleListItem): string | null =>
	a.categorySlug && a.seriesSlug
		? `/blog/${a.categorySlug}/series/${a.seriesSlug}`
		: null

/**
 * Плашка статьи для лент (последние / избранные посты).
 * Вся плашка — ссылка на статью (растянутая ссылка-подложка),
 * внизу — ссылка на серию. Строка серии резервирует место всегда,
 * чтобы плашки с серией и без неё были одной высоты.
 */
export function ArticleCard({ article }: ArticleCardProps) {
	const href = getArticleHref(article)
	const seriesHref = getSeriesHref(article)
	const seriesName = article.seriesName?.trim() || article.seriesSlug

	return (
		<article className='relative flex flex-col flex-shrink-0 w-[280px] md:w-[320px] rounded-xl border border-base-300 bg-base-200/50 p-4 hover:bg-base-200 hover:border-base-content/20 transition-colors'>
			<Link
				href={href}
				aria-label={article.title}
				className='absolute inset-0 z-0 rounded-xl'
			/>
			{article.category && (
				<span className='text-xs opacity-70'>{article.category}</span>
			)}
			<h3 className='font-bold text-base line-clamp-2 mt-1'>{article.title}</h3>
			{article.description ? (
				<p className='text-sm opacity-80 line-clamp-2 mt-2'>
					{article.description}
				</p>
			) : null}
			<div className='mt-auto pt-3 h-8 flex items-end min-w-0'>
				{seriesHref && seriesName ? (
					<Link
						href={seriesHref}
						className='relative z-10 text-xs truncate opacity-70 hover:opacity-100 underline underline-offset-2'
					>
						Серия: {seriesName}
					</Link>
				) : null}
			</div>
		</article>
	)
}
