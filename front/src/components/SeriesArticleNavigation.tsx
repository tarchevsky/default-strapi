import { getArticleHref } from '@/services/page.service'
import type { ArticleListItem } from '@/types/page.types'
import Link from 'next/link'

interface SeriesArticleNavigationProps {
	previousArticle?: ArticleListItem
	nextArticle?: ArticleListItem
	className?: string
}

function NavCard({
	direction,
	article,
}: {
	direction: 'prev' | 'next'
	article: ArticleListItem
}) {
	const isPrev = direction === 'prev'
	const arrow = isPrev ? '←' : '→'
	const label = isPrev ? 'Предыдущая статья' : 'Следующая статья'

	return (
		<Link
			href={getArticleHref(article)}
			className='group block rounded-2xl border border-gray-200 px-4 py-3 transition-colors duration-200 hover:border-gray-400'
		>
			<p className='mb-1 text-xs uppercase tracking-wide text-gray-500'>
				{arrow} {label}
			</p>
			<p className='text-sm md:text-base font-medium leading-snug group-hover:underline'>
				{article.title}
			</p>
		</Link>
	)
}

export default function SeriesArticleNavigation({
	previousArticle,
	nextArticle,
	className,
}: SeriesArticleNavigationProps) {
	if (!previousArticle && !nextArticle) return null

	return (
		<nav
			aria-label='Навигация по статьям серии'
			className={['cont my-6 md:my-8', className].filter(Boolean).join(' ')}
		>
			<div className='grid gap-3 md:grid-cols-2'>
				<div>{previousArticle ? <NavCard direction='prev' article={previousArticle} /> : null}</div>
				<div>{nextArticle ? <NavCard direction='next' article={nextArticle} /> : null}</div>
			</div>
		</nav>
	)
}
