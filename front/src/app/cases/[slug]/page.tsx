import { DynamicComponentRenderer } from '@/components/DynamicComponentRenderer'
import FadeIn from '@/components/ui/FadeIn'
import { getCaseBySlug, getCases } from '@/services/case.service'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface CasePageProps {
	params: Promise<{
		slug: string
	}>
}

export async function generateMetadata({
	params,
}: CasePageProps): Promise<Metadata> {
	const resolvedParams = await params
	const caseItem = await getCaseBySlug(resolvedParams.slug)

	if (!caseItem) {
		return {
			title: 'Кейс не найден',
		}
	}

	return {
		title: caseItem.title,
		description: caseItem.description,
	}
}

export default async function CasePage({ params }: CasePageProps) {
	const resolvedParams = await params
	const caseItem = await getCaseBySlug(resolvedParams.slug)
	const cases = await getCases()

	if (!caseItem) {
		notFound()
	}

	const titleComponent = caseItem.dynamic?.find(
		c => c.__component === 'text.title'
	)
	const restComponents =
		caseItem.dynamic?.filter(c => c.__component !== 'text.title') || []

	return (
		<>
			<FadeIn className='cont ind'>
				<Link href='/' className='my-4 block'>
					← Назад к списку
				</Link>
			</FadeIn>
			<article>
				{titleComponent ? (
					<DynamicComponentRenderer
						component={titleComponent}
						metaTitle={caseItem.title}
					/>
				) : (
					<h1 className='cont text-2xl font-bold mb-4'>{caseItem.title}</h1>
				)}
				{restComponents.length > 0 && (
					<div>
						{restComponents.map((component, index) => (
							<DynamicComponentRenderer
								key={`${caseItem.id}-${component.id}-${index}`}
								component={component}
								cases={cases}
								metaTitle={caseItem.title}
							/>
						))}
					</div>
				)}
			</article>
		</>
	)
}
