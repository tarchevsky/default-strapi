import { ArticleListItem } from '@/types/page.types'
import { ArticleCard } from '../card/ArticleCard'

interface FeaturedPostsCarouselProps {
	articles: ArticleListItem[]
}

/** Горизонтальная лента плашек статей (последние и избранные посты). */
export default function FeaturedPostsCarousel({
	articles,
}: FeaturedPostsCarouselProps) {
	if (!articles.length) return null

	return (
		<div className='w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-x-auto overflow-y-hidden'>
			<div className='flex items-stretch gap-4 py-2 px-[var(--cont-xs)] md:px-[var(--cont-sm)] min-w-max'>
				{articles.map(a => (
					<ArticleCard
						key={`${a.categorySlug ?? ''}-${a.seriesSlug ?? ''}-${a.slug}`}
						article={a}
					/>
				))}
			</div>
		</div>
	)
}
