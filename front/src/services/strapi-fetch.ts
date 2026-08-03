import { STRAPI_URL, STRAPI_URL_FALLBACK } from '@/constants/admin.constant'

const TIMEOUT_MS = 8_000

type StrapiFetchOptions = RequestInit & {
	next?: { tags?: string[]; revalidate?: number }
}

export async function strapiFetch<T>(
	path: string,
	options?: StrapiFetchOptions,
): Promise<T | null> {
	const tryFetch = async (baseUrl: string): Promise<T | null> => {
		const controller = new AbortController()
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
		try {
			const res = await fetch(`${baseUrl}${path}`, {
				...options,
				signal: controller.signal,
			})
			if (!res.ok) return null
			return (await res.json()) as T
		} catch (error) {
			console.warn(
				`Ошибка при обращении к ${baseUrl}:`,
				error instanceof Error ? error.message : error,
			)
			return null
		} finally {
			clearTimeout(timeout)
		}
	}

	const data = await tryFetch(STRAPI_URL)
	if (data) return data

	if (STRAPI_URL_FALLBACK && STRAPI_URL_FALLBACK !== STRAPI_URL) {
		return tryFetch(STRAPI_URL_FALLBACK)
	}

	return null
}
