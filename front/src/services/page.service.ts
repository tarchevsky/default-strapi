import { STRAPI_URL, STRAPI_URL_FALLBACK } from '@/constants/admin.constant'
import type {
	DynamicComponent,
	FeaturedPostsComponent,
	FeaturedSeriesComponent,
} from '@/types/dynamic.types'
import {
	ArticleListItem,
	CATEGORY_SLUG_MAP,
	Page,
	PageCategory,
	SearchResultItem,
	StrapiPagesResponse,
	getCategoryBySlug,
	getCategorySlug,
} from '@/types/page.types'
import { mapStrapiPageToPage } from '@/utils/page.mapper'

/** Поля страницы из ответа Strapi 5 (поддержка PascalCase и lowercase) */
function rawPageFields(p: StrapiPagesResponse['data'][number]) {
	const raw = p as unknown as Record<string, unknown>
	const series = (raw.Series ?? raw.series) as Record<string, unknown> | null | undefined
	const tags = (raw.Tags ?? raw.tags) as Array<{ Name?: string; name?: string }> | undefined
	return {
		Title: String(raw.Title ?? raw.title ?? ''),
		Slug: String(raw.Slug ?? raw.slug ?? ''),
		Category: (raw.Category ?? raw.category) as PageCategory | undefined,
		TypeOfPage: (raw.TypeOfPage ?? raw.typeOfPage) as string | undefined,
		Description: typeof (raw.Description ?? raw.description) === 'string' ? (raw.Description ?? raw.description) as string : undefined,
		SeriesOrder: (raw.SeriesOrder ?? raw.seriesOrder) as number | undefined,
		SeriesSlug: series
			? (series.SeriesSlug ?? series.seriesSlug) as string | undefined
			: undefined,
		Tags: Array.isArray(tags) ? tags : undefined,
	}
}

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

export const hasFeaturedSeriesInDynamic = (
	dynamic: DynamicComponent[],
): boolean =>
	Boolean(
		dynamic?.some(
			c =>
				c.__component === 'interactivity.featured-series' &&
				(c as FeaturedSeriesComponent).FeaturedSeries,
		),
	)

const STRAPI_FETCH_TIMEOUT_MS = 12_000

const fetchWithFallback = async (
	url: string,
	options?: RequestInit,
): Promise<Response | null> => {
	const tryFetch = async (baseUrl: string): Promise<Response | null> => {
		const controller = new AbortController()
		const timeout = setTimeout(
			() => controller.abort(),
			STRAPI_FETCH_TIMEOUT_MS,
		)
		try {
			const res = await fetch(`${baseUrl}${url}`, {
				...options,
				signal: controller.signal,
			})
			return res.ok ? res : null
		} catch (error) {
			const cause = error instanceof Error ? error.cause : undefined
			const code =
				cause && typeof cause === 'object' && 'code' in cause
					? (cause as NodeJS.ErrnoException).code
					: undefined
			const msg =
				code === 'ECONNRESET' || code === 'ECONNREFUSED'
					? `Strapi недоступен по адресу ${baseUrl} (${code}). Запустите бэкенд (например: cd back && bun run develop) и проверьте, что NEXT_PUBLIC_STRAPI_URL совпадает с портом Strapi (по умолчанию 1337).`
					: `Ошибка при обращении к ${baseUrl}: ${error instanceof Error ? error.message : String(error)}`
			console.warn(msg)
			return null
		} finally {
			clearTimeout(timeout)
		}
	}

	let res = await tryFetch(STRAPI_URL)
	if (res) return res

	if (STRAPI_URL_FALLBACK && STRAPI_URL_FALLBACK !== STRAPI_URL) {
		res = await tryFetch(STRAPI_URL_FALLBACK)
		if (res) {
			console.log(`Переключились на fallback URL: ${STRAPI_URL_FALLBACK}`)
			return res
		}
	}

	return null
}

const PAGE_POPULATE_BASE =
	'&populate[0]=Dynamic' +
	'&populate[Tags][fields][0]=Name' +
	'&populate[Series][fields][0]=SeriesSlug' +
	'&populate[Dynamic][on][text.paragraph][populate]=*' +
	'&populate[Dynamic][on][text.heading][populate]=*' +
	'&populate[Dynamic][on][text.title][populate]=*' +
	'&populate[Dynamic][on][text.blockquote][populate]=*' +
	'&populate[Dynamic][on][img.img][populate]=*' +
	'&populate[Dynamic][on][img.icon][populate]=*' +
	'&populate[Dynamic][on][decorative.line][populate]=*' +
	'&populate[Dynamic][on][interactivity.featured-posts][populate]=*' +
	'&populate[Dynamic][on][interactivity.featured-series][populate]=*' +
	'&populate[Dynamic][on][layout.grid][populate][Columns][populate][Img][populate]=*' +
	'&populate[Dynamic][on][layout.grid][populate][Columns][populate][Heading][populate]=*' +
	'&populate[Dynamic][on][layout.grid][populate][Columns][populate][Paragraph][populate]=*' +
	'&populate[Dynamic][on][layout.grid][populate][Columns][populate][Icon][populate]=*' +
	'&populate[Dynamic][on][blocks.hero][populate][Image][populate]=*' +
	'&populate[Dynamic][on][blocks.hero][populate][Title][populate]=*' +
	'&populate[Dynamic][on][blocks.hero][populate][Subtitle][populate]=*' +
	'&populate[Dynamic][on][steps.steps][populate]=*'

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
	const opts = { next: { tags: ['pages'], revalidate: 60 } }
	try {
		let res = await fetchWithFallback(
			`/api/pages?${slugFilter}${categoryFilter}${PAGE_POPULATE_BASE}`,
			opts,
		)
		if (!res) {
			const withoutFeaturedSeries = PAGE_POPULATE_BASE.replace(
				'&populate[Dynamic][on][interactivity.featured-series][populate]=*',
				'',
			)
			res = await fetchWithFallback(
				`/api/pages?${slugFilter}${categoryFilter}${withoutFeaturedSeries}`,
				opts,
			)
		}
		if (!res) return null
		const data: StrapiPagesResponse = await res.json()
		if (!data.data || data.data.length === 0) return null
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
			.filter(p => rawPageFields(p).TypeOfPage !== 'статья')
			.map(p => rawPageFields(p).Slug)
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
			.filter(p => {
				const f = rawPageFields(p)
				return f.Category && getCategorySlug(f.Category)
			})
			.map(p => {
				const f = rawPageFields(p)
				const category = getCategorySlug(f.Category!)
				return f.SeriesSlug ? { category, seriesSlug: f.SeriesSlug, slug: f.Slug } : { category, slug: f.Slug }
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
			const f = rawPageFields(p)
			const isArticle = f.TypeOfPage === 'статья'
			const categorySlug =
				isArticle && f.Category != null
					? getCategorySlug(f.Category)
					: undefined
			const seriesSlug = isArticle ? f.SeriesSlug : undefined
			const href =
				isArticle && categorySlug
					? seriesSlug
						? `/blog/${categorySlug}/series/${seriesSlug}/${f.Slug}`
						: `/blog/${categorySlug}/${f.Slug}`
					: `/${f.Slug}`
			return {
				title: f.Title,
				slug: f.Slug,
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
			const f = rawPageFields(p)
			const titleMatch = f.Title?.toLowerCase().includes(qLower)
			const tags = f.Tags ?? []
			const tagsMatch = tags.some(t => (t?.Name ?? t?.name ?? '').toLowerCase().includes(qLower))
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
			'/api/pages?filters[TypeOfPage][$eq]=статья&fields[0]=Title&fields[1]=Slug&fields[2]=Category&fields[3]=SeriesOrder' +
				'&sort[0]=publishedAt:desc' +
				'&populate[Tags][fields][0]=Name&populate[Series][fields][0]=SeriesSlug',
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []
		return data.data.map((p): ArticleListItem => {
			const f = rawPageFields(p)
			return {
				title: f.Title,
				slug: f.Slug,
				category: f.Category,
				categorySlug: f.Category != null ? getCategorySlug(f.Category) : undefined,
				seriesSlug: f.SeriesSlug ?? undefined,
				seriesOrder: f.SeriesOrder,
				tags: (f.Tags ?? []).map(t => t?.Name ?? t?.name ?? '').filter(Boolean),
			}
		})
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
			const f = rawPageFields(p)
			const seriesSlug = f.SeriesSlug
			if (!seriesSlug || seen.has(seriesSlug)) continue
			const raw = p as unknown as Record<string, unknown>
			const series = (raw.Series ?? raw.series) as Record<string, unknown> | undefined
			const name = series ? (String(series.SeriesName ?? series.seriesName ?? seriesSlug)) : seriesSlug
			seen.add(seriesSlug)
			result.push({ seriesSlug, name })
		}
		return result
	} catch (error) {
		console.error('Error fetching all series:', error)
		return []
	}
}

/** Последние N статей (для блока избранного в dynamic). Только статьи с категорией — ссылки ведут в /blog/.... */
export const getFeaturedArticles = async (
	limit = 10,
): Promise<ArticleListItem[]> => {
	try {
		const res = await fetchWithFallback(
			`/api/pages?filters[TypeOfPage][$eq]=статья&fields[0]=Title&fields[1]=Slug&fields[2]=Category&fields[3]=Description&fields[4]=SeriesOrder&sort[0]=publishedAt:desc&pagination[pageSize]=50&populate[Tags][fields][0]=Name&populate[Series][fields][0]=SeriesSlug`,
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []
		return data.data
			.filter(p => {
				const f = rawPageFields(p)
				return f.Category != null && getCategorySlug(f.Category)
			})
			.slice(0, limit)
			.map((p): ArticleListItem => {
				const f = rawPageFields(p)
				return {
					title: f.Title,
					slug: f.Slug,
					description: f.Description,
					category: f.Category,
					categorySlug: f.Category != null ? getCategorySlug(f.Category) : undefined,
					seriesSlug: f.SeriesSlug ?? undefined,
					seriesOrder: f.SeriesOrder,
					tags: (f.Tags ?? []).map(t => t?.Name ?? t?.name ?? '').filter(Boolean),
				}
			})
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
				`&fields[0]=Title&fields[1]=Slug&fields[2]=Category&fields[3]=SeriesOrder` +
				`&sort[0]=publishedAt:desc` +
				`&populate[Tags][fields][0]=Name` +
				`&populate[Series][fields][0]=SeriesSlug`,
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []
		return data.data.map((p): ArticleListItem => {
			const f = rawPageFields(p)
			return {
				title: f.Title,
				slug: f.Slug,
				category: f.Category,
				categorySlug: f.Category != null ? getCategorySlug(f.Category) : undefined,
				seriesSlug: f.SeriesSlug ?? undefined,
				seriesOrder: f.SeriesOrder,
				tags: (f.Tags ?? []).map(t => t?.Name ?? t?.name ?? '').filter(Boolean),
			}
		})
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
				`&fields[0]=Title&fields[1]=Slug&fields[2]=Category&fields[3]=SeriesOrder` +
				`&populate[Tags][fields][0]=Name` +
				`&populate[Series][fields][0]=SeriesSlug` +
				`&sort[0]=SeriesOrder:asc`,
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) return []
		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []
		const list = data.data.map((p): ArticleListItem => {
			const f = rawPageFields(p)
			return {
				title: f.Title,
				slug: f.Slug,
				category: f.Category,
				categorySlug: f.Category != null ? getCategorySlug(f.Category) : undefined,
				seriesSlug: f.SeriesSlug ?? undefined,
				seriesOrder: f.SeriesOrder,
				tags: (f.Tags ?? []).map(t => t?.Name ?? t?.name ?? '').filter(Boolean),
			}
		})
		return list.sort((a, b) => (a.seriesOrder ?? 999) - (b.seriesOrder ?? 999))
	} catch (error) {
		console.error('Error fetching articles by series:', error)
		return []
	}
}

/** Серии по категориям: строки { categorySlug, categoryLabel, series } — только категории с сериями. */
export const getSeriesRows = async (): Promise<
	{
		categorySlug: string
		categoryLabel: string
		series: { seriesSlug: string; name: string }[]
	}[]
> => {
	const slugs = Object.values(CATEGORY_SLUG_MAP) as string[]
	const rows: {
		categorySlug: string
		categoryLabel: string
		series: { seriesSlug: string; name: string }[]
	}[] = []
	for (const categorySlug of slugs) {
		const series = await getSeriesInCategory(categorySlug)
		if (series.length === 0) continue
		const categoryLabel = getCategoryBySlug(categorySlug)
		if (!categoryLabel) continue
		rows.push({
			categorySlug,
			categoryLabel,
			series: series.map(s => ({ seriesSlug: s.seriesSlug, name: s.name })),
		})
	}
	return rows
}

/** Серии, в которых есть статьи данной категории (для страницы категории). */
export const getSeriesInCategory = async (
	categorySlug: string,
): Promise<
	{ seriesSlug: string; name: string; description?: string | null }[]
> => {
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
		const result: {
			seriesSlug: string
			name: string
			description?: string | null
		}[] = []
		for (const p of data.data) {
			const f = rawPageFields(p)
			const seriesSlug = f.SeriesSlug
			if (!seriesSlug || seen.has(seriesSlug)) continue
			const raw = p as unknown as Record<string, unknown>
			const series = (raw.Series ?? raw.series) as Record<string, unknown> | undefined
			const name = series ? String(series.SeriesName ?? series.seriesName ?? seriesSlug) : seriesSlug
			const description = series ? (series.SeriesDescription ?? series.seriesDescription ?? null) as string | null : null
			seen.add(seriesSlug)
			result.push({ seriesSlug, name, description: description ?? undefined })
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
): Promise<{
	seriesSlug: string
	name: string
	description?: string | null
} | null> => {
	try {
		const res = await fetchWithFallback(
			`/api/series?filters[SeriesSlug][$eq]=${encodeURIComponent(seriesSlug)}` +
				`&fields[0]=SeriesName&fields[1]=SeriesSlug&fields[2]=SeriesDescription`,
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) return null
		const data = await res.json()
		const item = data.data?.[0] as Record<string, unknown> | undefined
		if (!item) return null
		const slugFromApi = String(item.SeriesSlug ?? item.seriesSlug ?? '')
		const name = String(item.SeriesName ?? item.seriesName ?? slugFromApi)
		const description = (item.SeriesDescription ?? item.seriesDescription ?? null) as string | null
		return { seriesSlug: slugFromApi, name, description }
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
			.filter(p => {
				const f = rawPageFields(p)
				return f.Category && getCategorySlug(f.Category) && f.SeriesSlug
			})
			.map(p => {
				const f = rawPageFields(p)
				return {
					category: getCategorySlug(f.Category!),
					seriesSlug: f.SeriesSlug!,
				}
			})
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
				`&fields[0]=Title&fields[1]=Slug&fields[2]=Category&fields[3]=SeriesOrder` +
				`&populate[Tags][fields][0]=Name` +
				`&populate[Series][fields][0]=SeriesSlug`,
			{ next: { tags: ['pages'], revalidate: 60 } },
		)

		if (!res) return []

		const data: StrapiPagesResponse = await res.json()
		if (!data.data?.length) return []

		return data.data.map((p): ArticleListItem => {
			const f = rawPageFields(p)
			return {
				title: f.Title,
				slug: f.Slug,
				category: f.Category,
				categorySlug: f.Category != null ? getCategorySlug(f.Category) : undefined,
				seriesSlug: f.SeriesSlug ?? undefined,
				seriesOrder: f.SeriesOrder,
				tags: (f.Tags ?? []).map(t => t?.Name ?? t?.name ?? '').filter(Boolean),
			}
		})
	} catch (error) {
		console.error('Error fetching articles by tag:', error)
		return []
	}
}
