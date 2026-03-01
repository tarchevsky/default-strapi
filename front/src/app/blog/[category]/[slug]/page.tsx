import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs'
import { DynamicComponentRenderer } from '@/components/DynamicComponentRenderer'
import FadeIn from '@/components/ui/FadeIn'
import {
	getArticlePathParams,
	getFeaturedArticles,
	getPageBySlug,
	hasFeaturedPostsInDynamic,
} from '@/services/page.service'
import { getCategoryBySlug } from '@/types/page.types'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
	try {
		return await getArticlePathParams()
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

	const page = await getPageBySlug(slug, category)
	const featuredArticles =
		page?.dynamic && hasFeaturedPostsInDynamic(page.dynamic)
			? await getFeaturedArticles(10)
			: []

	if (!page || page.typeOfPage !== 'статья') notFound()

	const categoryLabel = getCategoryBySlug(category)
	const breadcrumbItems = [
		{ label: 'Блог', href: '/blog' },
		...(categoryLabel
			? [{ label: categoryLabel, href: `/blog/${category}` }]
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
				{page.category && page.category !== 'Статья' && (
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
