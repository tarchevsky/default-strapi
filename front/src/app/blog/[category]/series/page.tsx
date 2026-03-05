import BarLinkList from '@/components/BarLinkList'
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
			<p className='prose'>
				Серии статей нужны для последовательного изучения той области знаний,
				которую вы сейчас или в будущем будете изучать с психологом. Здесь важна
				система и последовательность - поэтому выбрав ту или иную серию, вы
				всегда сможете вернуться к изученному материалу и повторно обдумать,
				актуализировать накопившийся опыт
			</p>
			<BarLinkList
				items={seriesList.map(s => ({
					href: `/blog/${category}/series/${s.seriesSlug}`,
					name: s.name,
					description: s.description ?? undefined,
				}))}
				className='list-none space-y-2 pl-0 pt-8 mb-20'
				emptyMessage='В этой категории пока нет серий.'
			/>
			<p className='mt-10'>
				<Link
					href={`/blog/${category}`}
					className='text-xs text-gray-400 border-t-1 border-t-gray-400 pt-2 transition-colors ease-in duration-200 hover:text-gray-600 hover:border-t-gray-600'
				>
					Обратно к категориям
				</Link>
			</p>
		</div>
	)
}
