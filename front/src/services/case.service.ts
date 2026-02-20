import { STRAPI_URL, STRAPI_URL_FALLBACK } from '@/constants/admin.constant'
import { Case } from '@/types/case.types'
import { mapStrapiCaseToCase } from '@/utils/case.mapper'
import axios from 'axios'

// Тип для сырых данных из Strapi API
interface StrapiCaseImageData {
	id: number
	documentId: string
	name: string
	alternativeText: string | null
	caption: string | null
	width: number
	height: number
	formats: {
		small?: {
			url: string
			width: number
			height: number
		}
		medium?: {
			url: string
			width: number
			height: number
		}
		thumbnail?: {
			url: string
			width: number
			height: number
		}
	}
	url: string
}

interface StrapiCaseData {
	id: number
	documentId: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	Title: string
	Description: string
	Slug: string
	Announce: string | null
	dynamic?: unknown[]
	CaseImage?: StrapiCaseImageData | null
}

// Тип для ответа Strapi API
interface StrapiResponse<T> {
	data: T[]
	meta?: {
		pagination?: {
			page: number
			pageSize: number
			pageCount: number
			total: number
		}
	}
}

// Легковесный кэш с TTL (5 минут)
interface UrlCache {
	url: string
	timestamp: number
}

const CACHE_TTL = 5 * 60 * 1000 // 5 минут
let urlCache: UrlCache | null = null

// Функция для получения данных с fallback логикой
const fetchWithFallback = async <T>(url: string): Promise<T | null> => {
	const now = Date.now()
	let currentUrl = STRAPI_URL

	// Проверяем кэш (только если не истек)
	if (urlCache && now - urlCache.timestamp < CACHE_TTL) {
		currentUrl = urlCache.url
	}

	// Пробуем текущий URL (из кэша или основной)
	try {
		const response = await axios.get(`${currentUrl}${url}`, {
			timeout: 8000, // 8 секунд таймаут
		})

		// Обновляем кэш только при успешном запросе
		urlCache = { url: currentUrl, timestamp: now }
		return response.data
	} catch (error) {
		console.warn(`Ошибка при обращении к ${currentUrl}:`, error)
		if (axios.isAxiosError(error)) {
			console.warn('Статус:', error.response?.status)
			console.warn('Данные ответа:', error.response?.data)
		}
	}

	// Пробуем fallback URL только если основной не сработал
	if (STRAPI_URL_FALLBACK && currentUrl !== STRAPI_URL_FALLBACK) {
		try {
			currentUrl = STRAPI_URL_FALLBACK
			const response = await axios.get(`${currentUrl}${url}`, {
				timeout: 8000,
			})

			// Обновляем кэш на fallback URL
			urlCache = { url: currentUrl, timestamp: now }
			console.log(`Переключились на fallback URL: ${currentUrl}`)
			return response.data
		} catch (error) {
			console.error(`Ошибка при обращении к fallback URL ${currentUrl}:`, error)
			if (axios.isAxiosError(error)) {
				console.error('Статус:', error.response?.status)
				console.error('Данные ответа:', error.response?.data)
			}
		}
	}

	// Сбрасываем кэш при полной недоступности
	urlCache = null
	return null
}

export const getCases = async (): Promise<Case[]> => {
	const data = await fetchWithFallback<StrapiResponse<unknown>>(
		'/api/cases?populate=*'
	)

	if (!data || !data.data) {
		console.warn('API недоступен или некорректный ответ для кейсов')
		return []
	}

	// Маппинг полей из Strapi в наши типы
	const mappedCases = data.data.map((item: unknown) =>
		mapStrapiCaseToCase(item as StrapiCaseData)
	)
	return mappedCases
}

export const getCaseBySlug = async (slug: string): Promise<Case | null> => {
	const data = await fetchWithFallback<StrapiResponse<unknown>>(
		`/api/cases?filters[Slug][$eq]=${slug}&populate=*`
	)

	if (!data || !data.data || data.data.length === 0) {
		console.warn(`Кейс с slug "${slug}" не найден или API недоступен`)
		return null
	}

	return mapStrapiCaseToCase(data.data[0] as StrapiCaseData)
}
