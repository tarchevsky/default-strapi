import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs'
import { DynamicComponentRenderer } from '@/components/DynamicComponentRenderer'
import FadeIn from '@/components/ui/FadeIn'
import ReadingProgressBar from '@/components/ui/ReadingProgressBar'
import ArticleToc from '@/components/ui/ArticleToc'
import {
	getArticlePathParams,
	getFeaturedArticles,
	getPageBySlug,
	getSeriesRows,
	hasFeaturedPostsInDynamic,
	hasFeaturedSeriesInDynamic,
} from '@/services/page.service'
import { getCategoryBySlug } from '@/types/page.types'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
	try {
		const params = await getArticlePathParams()
		return params
			.filter(p => !('seriesSlug' in p && p.seriesSlug))
			.map(p => ({ category: p.category, slug: p.slug }))
	} catch {
		return []
	}
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { category, slug } = await params
	const page = await getPageBySlug(slug, category)
	if (!page) return { title: 'Страница не найдена' }
	return { title: page.title, description: page.description }
}

export default async function Page({ params }: PageProps) {
	const { category, slug } = await params
	if (!getCategoryBySlug(category)) notFound()

	const [page, blogPage] = await Promise.all([
		getPageBySlug(slug, category),
		getPageBySlug('blog'),
	])
	const [featuredArticles, seriesRows] = await Promise.all([
		page?.dynamic && hasFeaturedPostsInDynamic(page.dynamic)
			? getFeaturedArticles(10)
			: Promise.resolve([]),
		page?.dynamic && hasFeaturedSeriesInDynamic(page.dynamic)
			? getSeriesRows()
			: Promise.resolve([]),
	])

	if (!page || page.typeOfPage !== 'статья' || page.seriesSlug)
		notFound()

	const categoryLabel = getCategoryBySlug(category)
	const breadcrumbItems = [
		{ label: blogPage?.title ?? 'Блог', href: '/blog' },
		...(categoryLabel
			? [{ label: categoryLabel, href: `/blog/${category}` }]
			: []),
		{ label: page.title },
	]
	const titleComponent = page.dynamic?.find(
		c => c.__component === 'text.title',
	)
	const restComponents =
		page.dynamic?.filter(c => c.__component !== 'text.title') || []

	return (
		<>
			<ReadingProgressBar />
			<div className='relative md:py-16 prose m-auto'>
				<ArticleToc containerId='article-content' />
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
					<div
						id='article-content'
						className='ind cont flex flex-col gap-6 md:gap-8 text-[15px] md:text-base leading-relaxed'
					>
						{restComponents.map((component, index) => (
							<DynamicComponentRenderer
								key={`${component.__component}-${component.id}-${index}`}
								component={component}
								featuredArticles={featuredArticles}
								seriesRows={seriesRows}
								metaTitle={page.title}
							/>
						))}
					</div>
				)}
			</div>
		</>
	)
}
