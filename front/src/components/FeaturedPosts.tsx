import type { ArticleListItem } from '@/types/page.types'
import Link from 'next/link'

interface FeaturedPostsProps {
	articles: ArticleListItem[]
}

function articleHref(item: ArticleListItem): string {
	if (item.categorySlug) return `/blog/${item.categorySlug}/${item.slug}`
	return `/#${item.slug}`
}

export function FeaturedPosts({ articles }: FeaturedPostsProps) {
	if (!articles.length) return null

	return (
		<div className="w-full overflow-x-auto overflow-y-hidden">
			<div className="flex gap-4 pb-2 -mx-[var(--cont-xs)] px-[var(--cont-xs)] md:-mx-[var(--cont-sm)] md:px-[var(--cont-sm)]">
				{articles.map((item) => (
					<Link
						key={`${item.categorySlug ?? ''}-${item.slug}`}
						href={articleHref(item)}
						className="flex-shrink-0 w-[280px] md:w-[320px] rounded-2xl border border-base-content/10 bg-base-100 p-4 hover:border-base-content/20 transition-colors block"
					>
						{item.categorySlug && (
							<span className="text-xs opacity-70">{item.category}</span>
						)}
						<h3 className="font-bold mt-1 line-clamp-2">{item.title}</h3>
						{item.description && (
							<p className="text-sm mt-2 opacity-80 line-clamp-2">
								{item.description}
							</p>
						)}
					</Link>
				))}
			</div>
		</div>
	)
}
