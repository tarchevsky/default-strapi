import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs'
import {
	getArticlesBySeries,
	getArticleHref,
	getPageBySlug,
	getSeriesBySlug,
	getSeriesPathParams,
} from '@/services/page.service'
import { getCategoryBySlug } from '@/types/page.types'
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
		<div className='cont md:py-16'>
			<Breadcrumbs items={breadcrumbItems} className='mb-4' />
			<h1 className='mb-6'>{series.name}</h1>
			{series.description && (
				<p className='mb-6 text-sm opacity-80 whitespace-pre-line'>
					{series.description}
				</p>
			)}
			{articles.length > 0 ? (
				<ul className='list-none space-y-2 pl-0'>
					{articles.map(article => (
						<li key={article.slug}>
							<Link
								href={getArticleHref(article)}
								className='link link-hover'
							>
								{article.title}
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p className='text-sm opacity-80'>В этой серии пока нет статей.</p>
			)}
			<p className='mt-6'>
				<Link
					href={`/blog/${category}/series`}
					className='link link-hover text-sm'
				>
					← К списку серий
				</Link>
			</p>
		</div>
	)
}
