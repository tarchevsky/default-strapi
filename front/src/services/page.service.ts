import { STRAPI_URL, STRAPI_URL_FALLBACK } from '@/constants/admin.constant'
import { Page, StrapiPagesResponse } from '@/types/page.types'
import { mapStrapiPageToPage } from '@/utils/page.mapper'

const fetchWithFallback = async (
	url: string,
	options?: RequestInit
): Promise<Response | null> => {
	let currentUrl = STRAPI_URL

	try {
		const res = await fetch(`${currentUrl}${url}`, options)
		if (res.ok) {
			return res
		}
	} catch (error) {
		console.warn(`Ошибка при обращении к ${currentUrl}:`, error)
	}

	if (STRAPI_URL_FALLBACK && currentUrl !== STRAPI_URL_FALLBACK) {
		try {
			currentUrl = STRAPI_URL_FALLBACK
			const res = await fetch(`${currentUrl}${url}`, options)
			if (res.ok) {
				console.log(`Переключились на fallback URL: ${currentUrl}`)
				return res
			}
		} catch (error) {
			console.error(`Ошибка при обращении к fallback URL ${currentUrl}:`, error)
		}
	}

	return null
}

export const getPageBySlug = async (slug: string): Promise<Page | null> => {
	try {
		const res = await fetchWithFallback(
			`/api/pages?filters[Slug][$eq]=${slug}` +
				`&populate[Dynamic][on][text.paragraph][populate]=*` +
				`&populate[Dynamic][on][text.heading][populate]=*` +
				`&populate[Dynamic][on][text.title][populate]=*` +
				`&populate[Dynamic][on][img.img][populate]=*` +
				`&populate[Dynamic][on][img.icon][populate]=*` +
				`&populate[Dynamic][on][decorative.line][populate]=*` +
				`&populate[Dynamic][on][interactivity.cases-carousel][populate]=*` +
				`&populate[Dynamic][on][layout.grid][populate][Columns][populate][Img][populate]=*` +
				`&populate[Dynamic][on][layout.grid][populate][Columns][populate][Heading][populate]=*` +
				`&populate[Dynamic][on][layout.grid][populate][Columns][populate][Paragraph][populate]=*` +
				`&populate[Dynamic][on][layout.grid][populate][Columns][populate][Icon][populate]=*`,
			{
				next: {
					tags: ['pages'],
					revalidate: 60,
				},
			}
		)

		if (!res) {
			return null
		}

		const data: StrapiPagesResponse = await res.json()

		if (!data.data || data.data.length === 0) {
			return null
		}

		return mapStrapiPageToPage(data.data[0])
	} catch (error) {
		console.error('Error fetching page:', error)
		return null
	}
}

export const getAllPageSlugs = async (): Promise<string[]> => {
	try {
		const res = await fetchWithFallback('/api/pages?fields[0]=Slug', {
			next: { tags: ['pages'] },
		})

		if (!res) {
			return []
		}

		const data: StrapiPagesResponse = await res.json()

		return data.data.map(page => page.Slug)
	} catch (error) {
		console.error('Error fetching page slugs:', error)
		return []
	}
}
