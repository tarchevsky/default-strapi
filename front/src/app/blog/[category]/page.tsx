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

			{seriesList.length > 0 && (
				<section className='mb-8'>
					<Link
						href={`/blog/${category}/series`}
						className='text-lg font-semibold link link-hover block mb-3'
					>
						Серии →
					</Link>
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
				</section>
			)}

			<section>
				<h2 className='text-lg font-semibold mb-3'>Статьи</h2>
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
					<p className='text-sm opacity-80'>В этой категории пока нет статей.</p>
				)}
			</section>

			<p className='mt-6'>
				<Link href='/blog' className='link link-hover text-sm'>
					← К всем статьям
				</Link>
			</p>
		</div>
	)
}
