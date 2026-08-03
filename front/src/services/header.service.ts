import { Header, StrapiHeader } from '@/types/header.types'
import { mapStrapiHeaderToHeader } from '@/utils/header.mapper'
import { strapiFetch } from './strapi-fetch'

interface StrapiResponse<T> {
	data: T
	meta?: unknown
}

export const DEFAULT_HEADER: Header = {
	menu: [
		{ id: 1, url: '/', label: 'Главная', order: 1 },
		{ id: 2, url: '/', label: 'Кейсы', order: 2 },
	],
	socials: [],
	contacts: {},
}

export const getHeader = async (): Promise<Header> => {
	const data = await strapiFetch<StrapiResponse<StrapiHeader>>(
		'/api/header?populate=*',
		{ next: { tags: ['header'], revalidate: 300 } },
	)

	if (!data?.data) {
		console.warn('API недоступен или header не настроен')
		return DEFAULT_HEADER
	}

	try {
		return mapStrapiHeaderToHeader(data.data)
	} catch (mapperError) {
		console.error('Ошибка при маппинге хеддера:', mapperError)
		return DEFAULT_HEADER
	}
}
