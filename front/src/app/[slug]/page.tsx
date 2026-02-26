import { DynamicComponentRenderer } from '@/components/DynamicComponentRenderer'
import FadeIn from '@/components/ui/FadeIn'
import { getCases } from '@/services/case.service'
import { getAllPageSlugs, getPageBySlug } from '@/services/page.service'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{
		slug: string
	}>
}

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
	const cases = await getCases()

	if (!page) {
		notFound()
	}

	const titleComponent = page.dynamic?.find(c => c.__component === 'text.title')
	const restComponents =
		page.dynamic?.filter(c => c.__component !== 'text.title') || []

	return (
		<>
			<FadeIn className='cont'>
				{titleComponent ? (
					<DynamicComponentRenderer
						component={titleComponent}
						metaTitle={page.title}
					/>
				) : (
					<h1 className='cont mb-4'>{page.title}</h1>
				)}
			</FadeIn>
			{restComponents.length > 0 && (
				<>
					{restComponents.map((component, index) => (
						<DynamicComponentRenderer
							key={`${component.__component}-${component.id}-${index}`}
							component={component}
							cases={cases}
							metaTitle={page.title}
						/>
					))}
				</>
			)}
		</>
	)
}
