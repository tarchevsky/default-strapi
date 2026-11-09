import { ArticleListItem } from '@/types/page.types'
import { ArticleCard } from '../card/ArticleCard'
import { SectionTitle } from '../SectionTitle'

interface FeaturedPostsCarouselProps {
	articles: ArticleListItem[]
	title?: string
}

/** Горизонтальная лента плашек последних статей. */
export default function FeaturedPostsCarousel({
	articles,
	title = 'Последние посты',
}: FeaturedPostsCarouselProps) {
	if (!articles.length) return null

	return (
		<section className='not-prose my-6 md:my-8'>
			<SectionTitle>{title}</SectionTitle>
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
		</section>
	)
}
