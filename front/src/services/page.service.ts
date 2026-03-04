import { STRAPI_URL, STRAPI_URL_FALLBACK } from '@/constants/admin.constant'
import type {
	DynamicComponent,
	FeaturedPostsComponent,
} from '@/types/dynamic.types'
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

export const hasFeaturedPostsInDynamic = (
	dynamic: DynamicComponent[],
): boolean =>
	Boolean(
		dynamic?.some(
			c =>
				c.__component === 'interactivity.featured-posts' &&
				(c as FeaturedPostsComponent).FeaturedPosts,
		),
	)

const fetchWithFallback = async (
	url: string,
	options?: RequestInit,
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
	categorySlug?: string,
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
				`&populate[Tags][fields][0]=Name` +
				`&populate[Series][fields][0]=SeriesSlug` +
				`&populate[Dynamic][on][text.paragraph][populate]=*` +
				`&populate[Dynamic][on][text.heading][populate]=*` +
				`&populate[Dynamic][on][text.title][populate]=*` +
				`&populate[Dynamic][on][text.blockquote][populate]=*` +
				`&populate[Dynamic][on][img.img][populate]=*` +
				`&populate[Dynamic][on][img.icon][populate]=*` +
				`&populate[Dynamic][on][decorative.line][populate]=*` +
				`&populate[Dynamic][on][interactivity.featured-posts][populate]=*` +
				`&populate[Dynamic][on][layout.grid][populate][Columns][populate][Img][populate]=*` +
				`&populate[Dynamic][on][layout.grid][populate][Columns][populate][Heading][populate]=*` +
				`&populate[Dynamic][on][layout.grid][populate][Columns][populate][Paragraph][populate]=*` +
				`&populate[Dynamic][on][layout.grid][populate][Columns][populate][Icon][populate]=*` +
				`&populate[Dynamic][on][blocks.hero][populate][Image][populate]=*` +
				`&populate[Dynamic][on][blocks.hero][populate][Title][populate]=*` +
				`&populate[Dynamic][on][blocks.hero][populate][Subtitle][populate]=*`,
			{
				next: {
					tags: ['pages'],
					revalidate: 60,
				},
			},
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
			{ next: { tags: ['pages'] } },
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

/** Параметры путей статей: без серии blog/[category]/[slug], с серией blog/[category]/[seriesSlug]/[slug]. */
export const getArticlePathParams = async (): Promise<
	{ category: string; slug: string; seriesSlug?: string }[]
> => {
	try {
		const res = await fetchWithFallback(
			'/api/pages?filters[TypeOfPage][$eq]=статья&fields[0]=Slug&fields[1]=Category&populate[Series][fields][0]=SeriesSlug',
			{ next: { tags: ['pages'] } },
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		return (data.data || [])
			.filter(p => p.Category && getCategorySlug(p.Category as PageCategory))
			.map(p => {
				const category = getCategorySlug(p.Category as PageCategory)
				const slug = p.Slug
				const seriesSlug = p.Series?.SeriesSlug
				return seriesSlug
					? { category, seriesSlug, slug }
					: { category, slug }
			})
	} catch (error) {
		console.error('Error fetching article path params:', error)
		return []
	}
}

/** Поиск страниц и статей по заголовку. Регистронезависимый. */
export const searchPagesAndArticles = async (
	query: string,
): Promise<SearchResultItem[]> => {
	const q = query.trim()
	if (!q) return []
	const qLower = q.toLowerCase()
	const mapToResults = (list: StrapiPagesResponse['data']) =>
		list.map((p): SearchResultItem => {
			const isArticle = p.TypeOfPage === 'статья'
			const categorySlug =
				isArticle && p.Category != null
					? getCategorySlug(p.Category as PageCategory)
					: undefined
			const seriesSlug = isArticle ? p.Series?.SeriesSlug : undefined
			const href =
				isArticle && categorySlug
					? seriesSlug
						? `/blog/${categorySlug}/series/${seriesSlug}/${p.Slug}`
						: `/blog/${categorySlug}/${p.Slug}`
					: `/${p.Slug}`
			return {
				title: p.Title,
				slug: p.Slug,
				href,
				type: isArticle ? 'article' : 'page',
			}
		})

	try {
		const opts = { next: { revalidate: 30 } as const }
		const urlBase = `/api/pages?fields[0]=Title&fields[1]=Slug&fields[2]=TypeOfPage&fields[3]=Category&pagination[pageSize]=50&populate[Tags][fields][0]=Name&populate[Series][fields][0]=SeriesSlug`

		const res = await fetchWithFallback(urlBase, opts)
		if (!res) return []

		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []

		const filtered = data.data.filter(p => {
			const titleMatch = p.Title?.toLowerCase().includes(qLower)
			const tags = p.Tags ?? []
			const tagsMatch = tags.some(t => t.Name.toLowerCase().includes(qLower))
			return Boolean(titleMatch || tagsMatch)
		})

		if (!filtered.length) return []
		return mapToResults(filtered)
	} catch (error) {
		console.error('Error searching pages:', error)
		return []
	}
}

/** Список страниц типа «статья» (для сайдбара блога), все статьи. */
export const getArticlePages = async (): Promise<ArticleListItem[]> => {
	try {
		const res = await fetchWithFallback(
			'/api/pages?filters[TypeOfPage][$eq]=статья&fields[0]=Title&fields[1]=Slug&fields[2]=Category' +
				'&sort[0]=publishedAt:desc' +
				'&populate[Tags][fields][0]=Name&populate[Series][fields][0]=SeriesSlug',
			{ next: { tags: ['pages'], revalidate: 60 } },
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
				seriesSlug: p.Series?.SeriesSlug ?? undefined,
				tags: p.Tags?.map(t => t.Name) ?? [],
			}),
		)
	} catch (error) {
		console.error('Error fetching article pages:', error)
		return []
	}
}

/** Все серии, в которых есть статьи (для сайдбара блога). */
export const getAllSeries = async (): Promise<
	{ seriesSlug: string; name: string }[]
> => {
	try {
		const res = await fetchWithFallback(
			'/api/pages?filters[TypeOfPage][$eq]=статья' +
				'&filters[Series][id][$notNull]=true' +
				'&fields[0]=id' +
				'&populate[Series][fields][0]=SeriesSlug&populate[Series][fields][1]=SeriesName',
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []
		const seen = new Set<string>()
		const result: { seriesSlug: string; name: string }[] = []
		for (const p of data.data) {
			if (!p.Series?.SeriesSlug || seen.has(p.Series.SeriesSlug)) continue
			seen.add(p.Series.SeriesSlug)
			result.push({
				seriesSlug: p.Series.SeriesSlug,
				name: (p.Series as { SeriesName?: string }).SeriesName ?? p.Series.SeriesSlug,
			})
		}
		return result
	} catch (error) {
		console.error('Error fetching all series:', error)
		return []
	}
}

/** Достаёт SeriesSlug из ответа Strapi (flat или data.attributes). */
function getSeriesSlugFromPage(p: StrapiPagesResponse['data'][number]): string | undefined {
	const s = p.Series as
		| { SeriesSlug?: string; data?: { attributes?: { SeriesSlug?: string } } }
		| null
		| undefined
	if (!s) return undefined
	return s.SeriesSlug ?? s.data?.attributes?.SeriesSlug ?? undefined
}

/** Последние N статей (для блока избранного в dynamic). Только статьи с категорией — ссылки ведут в /blog/.... */
export const getFeaturedArticles = async (
	limit = 10,
): Promise<ArticleListItem[]> => {
	try {
		const res = await fetchWithFallback(
			`/api/pages?filters[TypeOfPage][$eq]=статья&fields[0]=Title&fields[1]=Slug&fields[2]=Category&fields[3]=Description&sort[0]=publishedAt:desc&pagination[pageSize]=50&populate[Tags][fields][0]=Name&populate[Series][fields][0]=SeriesSlug`,
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []
		return data.data
			.filter(
				(p) =>
					p.Category != null && getCategorySlug(p.Category as PageCategory),
			)
			.slice(0, limit)
			.map(
				(p): ArticleListItem => ({
					title: p.Title,
					slug: p.Slug,
					description: p.Description,
					category: p.Category as PageCategory | undefined,
					categorySlug: getCategorySlug(p.Category as PageCategory),
					seriesSlug: getSeriesSlugFromPage(p),
					tags: p.Tags?.map(t => t.Name) ?? [],
				}),
			)
	} catch (error) {
		console.error('Error fetching featured articles:', error)
		return []
	}
}

/** Href статьи: с серией /blog/cat/series/seriesSlug/slug, без — /blog/cat/slug. */
export const getArticleHref = (a: {
	categorySlug?: string
	seriesSlug?: string
	slug: string
}): string => {
	if (!a.categorySlug) return `/${a.slug}`
	return a.seriesSlug
		? `/blog/${a.categorySlug}/series/${a.seriesSlug}/${a.slug}`
		: `/blog/${a.categorySlug}/${a.slug}`
}

/** Статьи одной категории по URL-слагу (для /blog/[category]), от новых к старым. */
export const getArticlesByCategory = async (
	categorySlug: string,
): Promise<ArticleListItem[]> => {
	const category = getCategoryBySlug(categorySlug)
	if (!category) return []

	try {
		const res = await fetchWithFallback(
			`/api/pages?filters[TypeOfPage][$eq]=статья` +
				`&filters[Category][$eq]=${encodeURIComponent(category)}` +
				`&fields[0]=Title&fields[1]=Slug&fields[2]=Category` +
				`&sort[0]=publishedAt:desc` +
				`&populate[Tags][fields][0]=Name` +
				`&populate[Series][fields][0]=SeriesSlug`,
			{ next: { tags: ['pages'], revalidate: 60 } },
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
				seriesSlug: p.Series?.SeriesSlug ?? undefined,
				tags: p.Tags?.map(t => t.Name) ?? [],
			}),
		)
	} catch (error) {
		console.error('Error fetching articles by category:', error)
		return []
	}
}

/** Статьи одной серии в категории (для /blog/[category]/[seriesSlug]). */
export const getArticlesBySeries = async (
	categorySlug: string,
	seriesSlug: string,
): Promise<ArticleListItem[]> => {
	const category = getCategoryBySlug(categorySlug)
	if (!category) return []

	try {
		const res = await fetchWithFallback(
			`/api/pages?filters[TypeOfPage][$eq]=статья` +
				`&filters[Category][$eq]=${encodeURIComponent(category)}` +
				`&filters[Series][SeriesSlug][$eq]=${encodeURIComponent(seriesSlug)}` +
				`&fields[0]=Title&fields[1]=Slug&fields[2]=Category` +
				`&sort[0]=publishedAt:desc` +
				`&populate[Tags][fields][0]=Name` +
				`&populate[Series][fields][0]=SeriesSlug`,
			{ next: { tags: ['pages'], revalidate: 60 } },
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
				seriesSlug: p.Series?.SeriesSlug ?? undefined,
				tags: p.Tags?.map(t => t.Name) ?? [],
			}),
		)
	} catch (error) {
		console.error('Error fetching articles by series:', error)
		return []
	}
}

/** Серии, в которых есть статьи данной категории (для страницы категории). */
export const getSeriesInCategory = async (
	categorySlug: string,
): Promise<{ seriesSlug: string; name: string; description?: string | null }[]> => {
	const category = getCategoryBySlug(categorySlug)
	if (!category) return []

	try {
		const res = await fetchWithFallback(
			`/api/pages?filters[TypeOfPage][$eq]=статья` +
				`&filters[Category][$eq]=${encodeURIComponent(category)}` +
				`&filters[Series][id][$notNull]=true` +
				`&fields[0]=id` +
				`&populate[Series][fields][0]=SeriesSlug&populate[Series][fields][1]=SeriesName&populate[Series][fields][2]=SeriesDescription`,
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []
		const seen = new Set<string>()
		const result: { seriesSlug: string; name: string; description?: string | null }[] = []
		for (const p of data.data) {
			if (!p.Series?.SeriesSlug || seen.has(p.Series.SeriesSlug)) continue
			seen.add(p.Series.SeriesSlug)
			const series = p.Series as { SeriesName?: string; SeriesDescription?: string | null }
			result.push({
				seriesSlug: p.Series.SeriesSlug,
				name: series.SeriesName ?? p.Series.SeriesSlug,
				description: series.SeriesDescription ?? null,
			})
		}
		return result
	} catch (error) {
		console.error('Error fetching series in category:', error)
		return []
	}
}

/** Серия по слагу (название для страницы серии). */
export const getSeriesBySlug = async (
	seriesSlug: string,
): Promise<{ seriesSlug: string; name: string; description?: string | null } | null> => {
	try {
		const res = await fetchWithFallback(
			`/api/series?filters[SeriesSlug][$eq]=${encodeURIComponent(seriesSlug)}` +
				`&fields[0]=SeriesName&fields[1]=SeriesSlug&fields[2]=SeriesDescription`,
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) return null
		const data = await res.json()
		const item = data.data?.[0]
		if (!item) return null
		return {
			seriesSlug: item.SeriesSlug,
			name: item.SeriesName ?? item.SeriesSlug,
			description: item.SeriesDescription ?? null,
		}
	} catch (error) {
		console.error('Error fetching series by slug:', error)
		return null
	}
}

/** Пары category + seriesSlug для generateStaticParams страниц серий. */
export const getSeriesPathParams = async (): Promise<
	{ category: string; seriesSlug: string }[]
> => {
	try {
		const res = await fetchWithFallback(
			'/api/pages?filters[TypeOfPage][$eq]=статья&filters[Series][id][$notNull]=true' +
				'&fields[0]=Category&populate[Series][fields][0]=SeriesSlug',
			{ next: { tags: ['pages'] } },
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		const seen = new Set<string>()
		return (data.data || [])
			.filter(
				p =>
					p.Category &&
					getCategorySlug(p.Category as PageCategory) &&
					p.Series?.SeriesSlug,
			)
			.map(p => ({
				category: getCategorySlug(p.Category as PageCategory),
				seriesSlug: p.Series!.SeriesSlug,
			}))
			.filter(({ category, seriesSlug }) => {
				const key = `${category}:${seriesSlug}`
				if (seen.has(key)) return false
				seen.add(key)
				return true
			})
	} catch (error) {
		console.error('Error fetching series path params:', error)
		return []
	}
}

/** Статьи, отфильтрованные по имени тега (Name из коллекции Tag) */
export const getArticlesByTag = async (
	tagName: string,
): Promise<ArticleListItem[]> => {
	const name = tagName.trim()
	if (!name) return []

	try {
		const res = await fetchWithFallback(
			`/api/pages?filters[TypeOfPage][$eq]=статья` +
				`&filters[Tags][Name][$eq]=${encodeURIComponent(name)}` +
				`&fields[0]=Title&fields[1]=Slug&fields[2]=Category` +
				`&populate[Tags][fields][0]=Name`,
			{ next: { tags: ['pages'], revalidate: 60 } },
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
				tags: p.Tags?.map(t => t.Name) ?? [],
			}),
		)
	} catch (error) {
		console.error('Error fetching articles by tag:', error)
		return []
	}
}
