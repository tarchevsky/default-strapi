import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs'
import { DynamicComponentRenderer } from '@/components/DynamicComponentRenderer'
import FadeIn from '@/components/ui/FadeIn'
import {
	getArticlePathParams,
	getFeaturedArticles,
	getPageBySlug,
	getSeriesBySlug,
	hasFeaturedPostsInDynamic,
} from '@/services/page.service'
import { getCategoryBySlug } from '@/types/page.types'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{
		category: string
		seriesSlug: string
		articleSlug: string
	}>
}

export async function generateStaticParams() {
	try {
		const params = await getArticlePathParams()
		return params
			.filter((p): p is typeof p & { seriesSlug: string } => !!p.seriesSlug)
			.map(p => ({
				category: p.category,
				seriesSlug: p.seriesSlug,
				articleSlug: p.slug,
			}))
	} catch {
		return []
	}
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { category, seriesSlug, articleSlug } = await params
	const page = await getPageBySlug(articleSlug, category)
	if (
		!page ||
		page.typeOfPage !== 'статья' ||
		page.seriesSlug !== seriesSlug
	)
		return { title: 'Страница не найдена' }
	return { title: page.title, description: page.description }
}

export default async function Page({ params }: PageProps) {
	const { category, seriesSlug, articleSlug } = await params
	if (!getCategoryBySlug(category)) notFound()

	const [page, blogPage, series] = await Promise.all([
		getPageBySlug(articleSlug, category),
		getPageBySlug('blog'),
		getSeriesBySlug(seriesSlug),
	])
	const featuredArticles =
		page?.dynamic && hasFeaturedPostsInDynamic(page.dynamic)
			? await getFeaturedArticles(10)
			: []

	if (
		!page ||
		page.typeOfPage !== 'статья' ||
		page.seriesSlug !== seriesSlug
	)
		notFound()

	const parentLabel = blogPage?.title ?? 'Блог'
	const categoryLabel = getCategoryBySlug(category)
	const seriesLabel = series?.name ?? seriesSlug
	const breadcrumbItems = [
		{ label: parentLabel, href: '/blog' },
		...(categoryLabel
			? [
					{ label: categoryLabel, href: `/blog/${category}` },
					{ label: 'Серии', href: `/blog/${category}/series` },
					{
						label: seriesLabel,
						href: `/blog/${category}/series/${seriesSlug}`,
					},
				]
			: []),
		{ label: page.title },
	]

	const titleComponent = page.dynamic?.find(c => c.__component === 'text.title')
	const restComponents =
		page.dynamic?.filter(c => c.__component !== 'text.title') || []

	return (
		<div className='md:py-16 prose m-auto'>
			<Breadcrumbs items={breadcrumbItems} className='mb-4' />
			<FadeIn>
				{page.category && page.category !== 'Статьи' && (
					<p className='mb-2 text-sm opacity-80'>{page.category}</p>
				)}
				{titleComponent ? (
					<DynamicComponentRenderer
						component={titleComponent}
						metaTitle={page.title}
					/>
				) : (
					<h1 className='mb-4 cont'>{page.title}</h1>
				)}
			</FadeIn>
			{restComponents.length > 0 && (
				<FadeIn className='ind cont flex flex-col gap-6 md:gap-8 text-[15px] md:text-base leading-relaxed'>
					{restComponents.map((component, index) => (
						<DynamicComponentRenderer
							key={`${component.__component}-${component.id}-${index}`}
							component={component}
							featuredArticles={featuredArticles}
							metaTitle={page.title}
						/>
					))}
				</FadeIn>
			)}
		</div>
	)
}
