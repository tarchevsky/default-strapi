import { STRAPI_URL, STRAPI_URL_FALLBACK } from '@/constants/admin.constant'
import { Header, StrapiHeader } from '@/types/header.types'
import { mapStrapiHeaderToHeader } from '@/utils/header.mapper'

import axios from 'axios'

interface StrapiResponse<T> {
	data: T
	meta?: unknown
}

interface UrlCache {
	url: string
	timestamp: number
}

const CACHE_TTL = 5 * 60 * 1000 // 5 минут
let urlCache: UrlCache | null = null

// Единый дефолтный хедер для фолбэка
export const DEFAULT_HEADER: Header = {
	menu: [
		{ id: 1, url: '/', label: 'Главная', order: 1 },
		{ id: 2, url: '/', label: 'Кейсы', order: 2 },
	],
	socials: [],
	contacts: {},
}

const fetchWithFallback = async <T>(url: string): Promise<T | null> => {
	const now = Date.now()
	let currentUrl = STRAPI_URL

	if (urlCache && now - urlCache.timestamp < CACHE_TTL) {
		currentUrl = urlCache.url
	}

	try {
		const response = await axios.get(`${currentUrl}${url}`, {
			timeout: 8000,
		})

		urlCache = { url: currentUrl, timestamp: now }
		return response.data
	} catch (error) {
		console.warn(`Ошибка при обращении к ${currentUrl}:`, error)
	}

	if (currentUrl !== STRAPI_URL_FALLBACK) {
		try {
			currentUrl = STRAPI_URL_FALLBACK
			const response = await axios.get(`${currentUrl}${url}`, {
				timeout: 8000,
			})

			urlCache = { url: currentUrl, timestamp: now }
			return response.data
		} catch (error) {
			console.error(`Ошибка при обращении к fallback URL ${currentUrl}:`, error)
		}
	}

	urlCache = null
	return null
}

export const getHeader = async (): Promise<Header> => {
	const data = await fetchWithFallback<StrapiResponse<StrapiHeader>>(
		'/api/header?populate=*'
	)

	if (!data || !data.data) {
		console.warn('API недоступен или header не настроен')
		// Возвращаем дефолтный хедер если API недоступен
		return DEFAULT_HEADER
	}

	try {
		return mapStrapiHeaderToHeader(data.data)
	} catch (mapperError) {
		console.error('Ошибка при маппинге хеддера:', mapperError)
		// Если маппинг упал, возвращаем дефолтные данные
		return DEFAULT_HEADER
	}
}
