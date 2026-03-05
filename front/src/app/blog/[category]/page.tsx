import BarLinkList from '@/components/BarLinkList'
import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs'
import {
	getArticlesByCategory,
	getArticleHref,
	getPageBySlug,
	getSeriesInCategory,
} from '@/services/page.service'
import { CATEGORY_SLUG_MAP, getCategoryBySlug } from '@/types/page.types'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ category: string }>
}

const CATEGORY_SLUGS = Object.values(CATEGORY_SLUG_MAP) as string[]

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
	return CATEGORY_SLUGS.map(category => ({ category }))
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { category } = await params
	const categoryLabel = getCategoryBySlug(category)
	if (!categoryLabel) return { title: 'Страница не найдена' }
	const blogPage = await getPageBySlug('blog')
	const parentTitle = blogPage?.title ?? 'Блог'
	return { title: `${categoryLabel} — ${parentTitle}` }
}

export default async function Page({ params }: PageProps) {
	const { category } = await params
	const categoryLabel = getCategoryBySlug(category)
	if (!categoryLabel) notFound()

	const [blogPage, articles, seriesList] = await Promise.all([
		getPageBySlug('blog'),
		getArticlesByCategory(category),
		getSeriesInCategory(category),
	])
	const parentLabel = blogPage?.title ?? 'Блог'

	const breadcrumbItems = [
		{ label: parentLabel, href: '/blog' },
		{ label: categoryLabel },
	]

	return (
		<div className='cont md:py-16'>
			<Breadcrumbs items={breadcrumbItems} className='mb-4' />
			<h1 className='mb-6'>{categoryLabel}</h1>

			<BarLinkList
				items={articles.map(article => ({
					href: getArticleHref(article),
					name: article.title,
				}))}
				className='list-none space-y-2 pl-0 pt-2 mb-10'
				emptyMessage='В этой категории пока нет статей.'
			/>

			{seriesList.length > 0 && (
				<section className='border-l-2 border-base-content/20 pl-4 py-2 mb-16'>
					<Link
						href={`/blog/${category}/series`}
						className='text-base font-semibold link link-hover block mb-3'
					>
						Серии
					</Link>
					<BarLinkList
						items={seriesList.map(s => ({
							href: `/blog/${category}/series/${s.seriesSlug}`,
							name: s.name,
							description: s.description ?? undefined,
						}))}
					/>
				</section>
			)}

			<p>
				<Link
				href='/blog'
				className='text-xs text-gray-400 border-t-1 border-t-gray-400 pt-2 transition-colors ease-in duration-200 hover:text-gray-600 hover:border-t-gray-600'
			>
				Обратно к статьям
			</Link>
			</p>
		</div>
	)
}
