import { STRAPI_URL, STRAPI_URL_FALLBACK } from '@/constants/admin.constant'
import { Footer, StrapiFooter } from '@/types/footer.types'
import { mapStrapiFooterToFooter } from '@/utils/footer.mapper'
import axios from 'axios'

interface StrapiResponse<T> {
	data: T
	meta?: unknown
}

interface UrlCache {
	url: string
	timestamp: number
}

const CACHE_TTL = 5 * 60 * 1000
let urlCache: UrlCache | null = null

const fetchWithFallback = async <T>(url: string): Promise<T | null> => {
	const now = Date.now()
	let currentUrl = STRAPI_URL

	if (urlCache && now - urlCache.timestamp < CACHE_TTL) {
		currentUrl = urlCache.url
	}

	try {
		const response = await axios.get(`${currentUrl}${url}`, { timeout: 8000 })
		urlCache = { url: currentUrl, timestamp: now }
		return response.data
	} catch (error) {
		console.warn(`Ошибка при обращении к ${currentUrl}:`, error)
	}

	if (STRAPI_URL_FALLBACK && currentUrl !== STRAPI_URL_FALLBACK) {
		try {
			const response = await axios.get(`${STRAPI_URL_FALLBACK}${url}`, {
				timeout: 8000,
			})
			urlCache = { url: STRAPI_URL_FALLBACK, timestamp: now }
			return response.data
		} catch (error) {
			console.error(`Ошибка при обращении к fallback URL:`, error)
		}
	}

	urlCache = null
	return null
}

export const getFooter = async (): Promise<Footer | null> => {
	const data = await fetchWithFallback<StrapiResponse<StrapiFooter>>(
		'/api/footer?populate=*'
	)

	if (!data?.data) return null

	try {
		return mapStrapiFooterToFooter(data.data)
	} catch {
		return null
	}
}
