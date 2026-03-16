import BarLinkList from '@/components/BarLinkList'
import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs'
import {
	getArticlesBySeries,
	getArticleHref,
	getPageBySlug,
	getSeriesBySlug,
	getSeriesPathParams,
} from '@/services/page.service'
import { getCategoryBySlug } from '@/types/page.types'
import ReadingProgressBar from '@/components/ui/ReadingProgressBar'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ category: string; seriesSlug: string }>
}

export async function generateStaticParams() {
	try {
		return await getSeriesPathParams()
	} catch {
		return []
	}
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { category, seriesSlug } = await params
	const series = await getSeriesBySlug(seriesSlug)
	if (!series) return { title: 'Страница не найдена' }
	const blogPage = await getPageBySlug('blog')
	const categoryLabel = getCategoryBySlug(category)
	return {
		title: `${series.name} — ${categoryLabel ?? ''} — ${blogPage?.title ?? 'Блог'}`,
	}
}

export default async function Page({ params }: PageProps) {
	const { category, seriesSlug } = await params
	if (!getCategoryBySlug(category)) notFound()

	const [blogPage, series, articles] = await Promise.all([
		getPageBySlug('blog'),
		getSeriesBySlug(seriesSlug),
		getArticlesBySeries(category, seriesSlug),
	])
	if (!series) notFound()

	const categoryLabel = getCategoryBySlug(category)
	const breadcrumbItems = [
		{ label: blogPage?.title ?? 'Блог', href: '/blog' },
		{ label: categoryLabel ?? '', href: `/blog/${category}` },
		{ label: 'Серии', href: `/blog/${category}/series` },
		{ label: series.name },
	]

	return (
		<>
			<ReadingProgressBar />
			<div className='cont md:py-16'>
				<Breadcrumbs items={breadcrumbItems} className='mb-4' />
				<h1 className='mb-6'>{series.name}</h1>
				{series.description && (
					<p className='prose mb-8 whitespace-pre-line'>
						{series.description}
					</p>
				)}
				<BarLinkList
					items={articles.map(article => ({
						href: getArticleHref(article),
						name: article.title,
					}))}
					className='list-none space-y-2 pl-0 pt-8 mb-20'
					emptyMessage='В этой серии пока нет статей.'
				/>
				<p className='mt-10'>
					<Link
						href={`/blog/${category}/series`}
						className='text-xs text-gray-400 border-t-1 border-t-gray-400 pt-2 transition-colors ease-in duration-200 hover:text-gray-600 hover:border-t-gray-600'
					>
						Обратно к сериям
					</Link>
				</p>
			</div>
		</>
	)
}
