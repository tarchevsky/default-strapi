import { DynamicComponentRenderer } from '@/components/DynamicComponentRenderer'
import FadeIn from '@/components/ui/FadeIn'
import { getCases } from '@/services/case.service'
import { getPageBySlug } from '@/services/page.service'

import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPageBySlug('home')
	if (page) {
		return {
			title: page.title,
			description: page.description,
		}
	}
	return {
		title: 'Проект на NextJS + Strapi CMS',
		description: 'Дескрипшен',
	}
}

export default async function Home() {
	const page = await getPageBySlug('home')
	const cases = await getCases()

	if (page) {
		return (
			<>
				{page.dynamic && page.dynamic.length > 0 && (
					<>
						{page.dynamic.map((component, index) => (
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

	// fallback: дефолтный контент
	return (
		<FadeIn className='cont'>
			<h1>Добро пожаловать!</h1>
			<p>
				Для начала работы создайте страницу в Strapi CMS в разделе Page и дайте
				странице адрес /home
			</p>
		</FadeIn>
	)
}
