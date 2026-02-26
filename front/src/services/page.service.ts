import { STRAPI_URL, STRAPI_URL_FALLBACK } from '@/constants/admin.constant'
import {
	ArticleListItem,
	Page,
	PageCategory,
	SearchResultItem,
	StrapiPagesResponse,
	getCategoryBySlug,
	getCategorySlug,
} from '@/types/page.types'
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

export const getPageBySlug = async (
	slug: string,
	categorySlug?: string
): Promise<Page | null> => {
	const slugFilter = `filters[Slug][$eq]=${slug}`
	const categoryFilter =
		categorySlug != null
			? (() => {
					const cat = getCategoryBySlug(categorySlug)
					return cat ? `&filters[Category][$eq]=${encodeURIComponent(cat)}` : ''
				})()
			: ''
	try {
		const res = await fetchWithFallback(
			`/api/pages?${slugFilter}${categoryFilter}` +
				`&populate[Dynamic][on][text.paragraph][populate]=*` +
				`&populate[Dynamic][on][text.heading][populate]=*` +
				`&populate[Dynamic][on][text.title][populate]=*` +
				`&populate[Dynamic][on][text.blockquote][populate]=*` +
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

/** Слаги только для обычных страниц (не статей). Статьи живут в /blog/[category]/[slug]. */
export const getAllPageSlugs = async (): Promise<string[]> => {
	try {
		const res = await fetchWithFallback(
			'/api/pages?fields[0]=Slug&fields[1]=TypeOfPage',
			{ next: { tags: ['pages'] } }
		)

		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		return (data.data || [])
			.filter(p => p.TypeOfPage !== 'статья')
			.map(p => p.Slug)
	} catch (error) {
		console.error('Error fetching page slugs:', error)
		return []
	}
}

/** Параметры путей статей для generateStaticParams: blog/[category]/[slug]. */
export const getArticlePathParams = async (): Promise<
	{ category: string; slug: string }[]
> => {
	try {
		const res = await fetchWithFallback(
			'/api/pages?filters[TypeOfPage][$eq]=статья&fields[0]=Slug&fields[1]=Category',
			{ next: { tags: ['pages'] } }
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		return (data.data || [])
			.filter(p => p.Category && getCategorySlug(p.Category as PageCategory))
			.map(p => ({
				category: getCategorySlug(p.Category as PageCategory),
				slug: p.Slug,
			}))
	} catch (error) {
		console.error('Error fetching article path params:', error)
		return []
	}
}

/** Поиск страниц и статей по заголовку. Регистронезависимый. */
export const searchPagesAndArticles = async (
	query: string
): Promise<SearchResultItem[]> => {
	const q = query.trim()
	if (!q) return []
	const qLower = q.toLowerCase()
	const mapToResults = (list: StrapiPagesResponse['data']) =>
		list
			.filter((p) => p.Title?.toLowerCase().includes(qLower))
			.map((p): SearchResultItem => {
				const isArticle = p.TypeOfPage === 'статья'
				const categorySlug =
					isArticle && p.Category != null
						? getCategorySlug(p.Category as PageCategory)
						: undefined
				return {
					title: p.Title,
					slug: p.Slug,
					href: isArticle && categorySlug
						? `/blog/${categorySlug}/${p.Slug}`
						: `/${p.Slug}`,
					type: isArticle ? 'article' : 'page',
				}
			})

	try {
		const opts = { next: { revalidate: 30 } as const }
		const urlBase =
			`/api/pages?fields[0]=Title&fields[1]=Slug&fields[2]=TypeOfPage&fields[3]=Category&pagination[pageSize]=50`
		// Сначала $containsi; при пустом ответе — $contains (на случай если $containsi не поддерживается)
		let res = await fetchWithFallback(
			`${urlBase}&filters[Title][$containsi]=${encodeURIComponent(q)}`,
			opts
		)
		if (!res) return []
		let data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) {
			res = await fetchWithFallback(
				`${urlBase}&filters[Title][$contains]=${encodeURIComponent(q)}`,
				opts
			)
			if (!res) return []
			data = await res.json()
		}
		if (!data.data?.length) {
			// Fallback: без фильтра по Title (на случай иного формата API)
			res = await fetchWithFallback(urlBase, opts)
			if (!res) return []
			data = await res.json()
		}
		if (!data.data?.length) return []
		return mapToResults(data.data)
	} catch (error) {
		console.error('Error searching pages:', error)
		return []
	}
}

/** Список страниц типа «статья» (для сайдбара блога) */
export const getArticlePages = async (): Promise<ArticleListItem[]> => {
	try {
		const res = await fetchWithFallback(
			'/api/pages?filters[TypeOfPage][$eq]=статья&fields[0]=Title&fields[1]=Slug&fields[2]=Category',
			{ next: { tags: ['pages'], revalidate: 60 } }
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []
		return data.data.map(
			(p): ArticleListItem => ({
				title: p.Title,
				slug: p.Slug,
				category: p.Category as PageCategory | undefined,
				categorySlug:
					p.Category != null
						? getCategorySlug(p.Category as PageCategory)
						: undefined,
			})
		)
	} catch (error) {
		console.error('Error fetching article pages:', error)
		return []
	}
}
