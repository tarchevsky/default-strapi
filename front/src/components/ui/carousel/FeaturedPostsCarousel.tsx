'use client'

import { ArticleListItem } from '@/types/page.types'
import Link from 'next/link'

interface FeaturedPostsCarouselProps {
	articles: ArticleListItem[]
}

export default function FeaturedPostsCarousel({ articles }: FeaturedPostsCarouselProps) {
	if (!articles.length) return null

	return (
		<div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-x-auto overflow-y-hidden">
			<div className="flex gap-4 py-2 px-[var(--cont-xs)] md:px-[var(--cont-sm)] min-w-max">
				{articles.map((a) => {
					const href = a.categorySlug ? `/blog/${a.categorySlug}/${a.slug}` : `/${a.slug}`
					return (
						<Link
							key={`${a.categorySlug ?? ''}-${a.slug}`}
							href={href}
							className="flex-shrink-0 w-[280px] md:w-[320px] rounded-xl border border-base-300 bg-base-200/50 p-4 hover:bg-base-200 hover:border-base-content/20 transition-colors"
						>
							{a.category && (
								<span className="text-xs opacity-70">{a.category}</span>
							)}
							<h3 className="font-bold text-base line-clamp-2 mt-1">{a.title}</h3>
							{a.description ? (
								<p className="text-sm opacity-80 line-clamp-2 mt-2">{a.description}</p>
							) : null}
						</Link>
					)
				})}
			</div>
		</div>
	)
}
