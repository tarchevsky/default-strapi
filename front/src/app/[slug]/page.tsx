import { DynamicComponentRenderer } from '@/components/DynamicComponentRenderer'
import BlogLayout from '@/components/layout/BlogLayout'
import FadeIn from '@/components/ui/FadeIn'
import {
	getAllPageSlugs,
	getAllSeries,
	getArticlePages,
	getFeaturedArticles,
	getPageBySlug,
	getSeriesRows,
	hasFeaturedPostsInDynamic,
	hasFeaturedSeriesInDynamic,
} from '@/services/page.service'
import { getCategorySlug } from '@/types/page.types'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
	params: Promise<{
		slug: string
	}>
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
	try {
		const slugs = await getAllPageSlugs()
		return slugs.map(slug => ({ slug }))
	} catch (error) {
		console.error('Error fetching page slugs:', error)
		return []
	}
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params
	const page = await getPageBySlug(slug)

	if (!page) {
		return {
			title: 'Страница не найдена',
		}
	}

	return {
		title: page.title,
		description: page.description,
	}
}

export default async function Page({ params }: PageProps) {
	const { slug } = await params
	const page = await getPageBySlug(slug)
	const [featuredArticles, seriesRows] = await Promise.all([
		page?.dynamic && hasFeaturedPostsInDynamic(page.dynamic)
			? getFeaturedArticles(10)
			: Promise.resolve([]),
		page?.dynamic && hasFeaturedSeriesInDynamic(page.dynamic)
			? getSeriesRows()
			: Promise.resolve([]),
	])

	if (!page) {
		notFound()
	}

	// Статьи живут по /blog/[category]/[slug] или /blog/[category]/[seriesSlug]/[slug]
	if (page.typeOfPage === 'статья') {
		if (page.category) {
			const catSlug = getCategorySlug(page.category)
			const path = page.seriesSlug
				? `/blog/${catSlug}/series/${page.seriesSlug}/${slug}`
				: `/blog/${catSlug}/${slug}`
			redirect(path)
		}
		notFound()
	}

	const titleComponent = page.dynamic?.find(c => c.__component === 'text.title')
	const restComponents =
		page.dynamic?.filter(c => c.__component !== 'text.title') || []

	const isBlog = page.typeOfPage === 'блог'

	const content = (
		<>
			<FadeIn className={isBlog ? undefined : 'cont'}>
				{titleComponent ? (
					<DynamicComponentRenderer
						component={titleComponent}
						metaTitle={page.title}
					/>
				) : (
					<h1 className={isBlog ? 'mb-4' : 'cont mb-4'}>{page.title}</h1>
				)}
			</FadeIn>
			{restComponents.length > 0 && (
				<>
					{					restComponents.map((component, index) => (
						<DynamicComponentRenderer
							key={`${component.__component}-${component.id}-${index}`}
							component={component}
							featuredArticles={featuredArticles}
							seriesRows={seriesRows}
							metaTitle={page.title}
						/>
					))}
				</>
			)}
		</>
	)

	if (isBlog) {
		const [articles, seriesList] = await Promise.all([
			getArticlePages(),
			getAllSeries(),
		])
		return (
			<BlogLayout articles={articles} seriesList={seriesList}>
				{content}
			</BlogLayout>
		)
	}

	return <>{content}</>
}
