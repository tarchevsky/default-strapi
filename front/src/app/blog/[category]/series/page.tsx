import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs'
import { getPageBySlug, getSeriesInCategory } from '@/services/page.service'
import { CATEGORY_SLUG_MAP, getCategoryBySlug } from '@/types/page.types'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ category: string }>
}

const CATEGORY_SLUGS = Object.values(CATEGORY_SLUG_MAP) as string[]

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
	return { title: `Серии — ${categoryLabel} — ${blogPage?.title ?? 'Блог'}` }
}

export default async function Page({ params }: PageProps) {
	const { category } = await params
	const categoryLabel = getCategoryBySlug(category)
	if (!categoryLabel) notFound()

	const [blogPage, seriesList] = await Promise.all([
		getPageBySlug('blog'),
		getSeriesInCategory(category),
	])
	const parentLabel = blogPage?.title ?? 'Блог'

	const breadcrumbItems = [
		{ label: parentLabel, href: '/blog' },
		{ label: categoryLabel, href: `/blog/${category}` },
		{ label: 'Серии' },
	]

	return (
		<div className='cont md:py-16'>
			<Breadcrumbs items={breadcrumbItems} className='mb-4' />
			<h1 className='mb-6'>Серии</h1>
			{seriesList.length > 0 ? (
				<ul className='list-none space-y-2 pl-0'>
					{seriesList.map(s => (
						<li key={s.seriesSlug}>
							<Link
								href={`/blog/${category}/series/${s.seriesSlug}`}
								className='link link-hover'
							>
								{s.name}
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p className='text-sm opacity-80'>В этой категории пока нет серий.</p>
			)}
			<p className='mt-6'>
				<Link
					href={`/blog/${category}`}
					className='link link-hover text-sm'
				>
					← К категории
				</Link>
			</p>
		</div>
	)
}
