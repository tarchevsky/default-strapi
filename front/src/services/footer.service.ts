import { Footer, StrapiFooter } from '@/types/footer.types'
import { mapStrapiFooterToFooter } from '@/utils/footer.mapper'
import { strapiFetch } from './strapi-fetch'

interface StrapiResponse<T> {
	data: T
	meta?: unknown
}

export const getFooter = async (): Promise<Footer | null> => {
	const data = await strapiFetch<StrapiResponse<StrapiFooter>>(
		'/api/footer?populate=*',
		{ next: { tags: ['footer'], revalidate: 300 } },
	)

	if (!data?.data) return null

	try {
		return mapStrapiFooterToFooter(data.data)
	} catch {
		return null
	}
}
