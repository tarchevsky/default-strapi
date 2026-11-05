import { fetchWithFallback, getArticleHref } from '@/services/page.service'
import { getCategorySlug, type PageCategory } from '@/types/page.types'
import {
	EMPTY_SEARCH_RESPONSE,
	type SearchResponse,
	type SearchTagHit,
} from '@/types/search.types'

const PAGE_SIZE = 100
const MAX_PAGES = 20
const SNIPPET_RADIUS = 80

const LIMITS = { articles: 20, texts: 20, series: 10, tags: 10, tagArticles: 10, pages: 10 }

/** Только текстовые блоки Dynamic — картинки и прочее не тянем */
const SEARCH_POPULATE =
	'&fields[0]=Title&fields[1]=Slug&fields[2]=TypeOfPage&fields[3]=Category&fields[4]=Description' +
	'&populate[Tags][fields][0]=Name' +
	'&populate[Series][fields][0]=SeriesSlug&populate[Series][fields][1]=SeriesName&populate[Series][fields][2]=SeriesDescription' +
	'&populate[Dynamic][on][text.paragraph][populate]=*' +
	'&populate[Dynamic][on][text.heading][populate]=*' +
	'&populate[Dynamic][on][text.title][populate]=*' +
	'&populate[Dynamic][on][text.blockquote][populate]=*' +
	'&populate[Dynamic][on][steps.steps][populate]=*' +
	'&populate[Dynamic][on][layout.grid][populate][Columns][populate][Heading][populate]=*' +
	'&populate[Dynamic][on][layout.grid][populate][Columns][populate][Paragraph][populate]=*' +
	'&populate[Dynamic][on][blocks.hero][populate][Title][populate]=*' +
	'&populate[Dynamic][on][blocks.hero][populate][Subtitle][populate]=*'

/** Ключи компонентов, в которых лежит видимый текст */
const TEXT_KEYS = new Set([
	'Paragraph',
	'Heading',
	'Title',
	'BlockquoteText',
	'BlockquoteSubtext',
	'StepTitle',
	'StepText',
	'StepCaption',
])

interface IndexedDoc {
	title: string
	description: string
	body: string
	href: string
	isArticle: boolean
	category?: PageCategory
	tags: string[]
	series?: { slug: string; name: string; description: string }
}

type Raw = Record<string, unknown>

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const pick = (raw: Raw, key: string) => raw[key] ?? raw[key[0].toLowerCase() + key.slice(1)]

/** Нормализация для сравнения: регистр и ё→е (длина строки не меняется) */
const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е')

/** Markdown/HTML → плоский текст */
const toPlain = (s: string) =>
	s
		.replace(/<[^>]+>/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[*_`#>~|]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

const collectText = (node: unknown, out: string[]) => {
	if (Array.isArray(node)) {
		node.forEach(n => collectText(n, out))
		return
	}
	if (!node || typeof node !== 'object') return
	for (const [key, value] of Object.entries(node as Raw)) {
		if (typeof value === 'string') {
			if (TEXT_KEYS.has(key)) out.push(toPlain(value))
		} else if (value && typeof value === 'object') {
			collectText(value, out)
		}
	}
}

const toDoc = (raw: Raw): IndexedDoc | null => {
	const slug = str(pick(raw, 'Slug'))
	if (!slug) return null
	const isArticle = pick(raw, 'TypeOfPage') === 'статья'
	const category = pick(raw, 'Category') as PageCategory | undefined
	const seriesRaw = pick(raw, 'Series') as Raw | null | undefined
	const seriesSlug = seriesRaw ? str(pick(seriesRaw, 'SeriesSlug')) : ''
	const tagsRaw = pick(raw, 'Tags')
	const tags = Array.isArray(tagsRaw)
		? tagsRaw.map(t => str(pick(t as Raw, 'Name'))).filter(Boolean)
		: []
	const bodyParts: string[] = []
	collectText(pick(raw, 'Dynamic'), bodyParts)
	const categorySlug = isArticle && category ? getCategorySlug(category) : undefined

	return {
		title: str(pick(raw, 'Title')),
		description: toPlain(str(pick(raw, 'Description'))),
		body: bodyParts.filter(Boolean).join(' '),
		href: isArticle
			? getArticleHref({ categorySlug, seriesSlug: seriesSlug || undefined, slug })
			: slug === 'home' || slug === 'main'
				? '/'
				: `/${slug}`,
		isArticle,
		category,
		tags,
		series:
			isArticle && seriesSlug && seriesRaw
				? {
						slug: seriesSlug,
						name: str(pick(seriesRaw, 'SeriesName')) || seriesSlug,
						description: toPlain(str(pick(seriesRaw, 'SeriesDescription'))),
					}
				: undefined,
	}
}

/** Все опубликованные страницы и статьи с текстом (кэш Next, сбрасывается тегом pages) */
const loadIndex = async (): Promise<IndexedDoc[]> => {
	const docs: IndexedDoc[] = []
	for (let page = 1; page <= MAX_PAGES; page++) {
		const res = await fetchWithFallback(
			`/api/pages?pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}&sort[0]=publishedAt:desc${SEARCH_POPULATE}`,
			{ next: { tags: ['pages'], revalidate: 60 } },
		)
		if (!res) break
		const json = (await res.json()) as {
			data?: Raw[]
			meta?: { pagination?: { pageCount?: number } }
		}
		for (const raw of json.data ?? []) {
			const doc = toDoc(raw)
			if (doc) docs.push(doc)
		}
		if (page >= (json.meta?.pagination?.pageCount ?? 1)) break
	}
	return docs
}

const makeMatcher = (query: string) => {
	const words = norm(query).split(/\s+/).filter(Boolean)
	return {
		words,
		test: (text: string) => {
			if (!text) return false
			const n = norm(text)
			return words.every(w => n.includes(w))
		},
	}
}

/** Фрагмент текста вокруг первого совпадения */
const makeSnippet = (text: string, words: string[]) => {
	const n = norm(text)
	const idx = Math.max(
		0,
		Math.min(...words.map(w => n.indexOf(w)).filter(i => i >= 0)),
	)
	let start = Math.max(0, idx - SNIPPET_RADIUS)
	let end = Math.min(text.length, idx + SNIPPET_RADIUS * 2)
	// Не режем слова пополам
	if (start > 0) {
		const space = text.indexOf(' ', start)
		if (space !== -1 && space < idx) start = space + 1
	}
	if (end < text.length) {
		const space = text.lastIndexOf(' ', end)
		if (space > idx) end = space
	}
	return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}

/** Поиск по всему контенту: заголовки, текст статей, серии, теги, страницы */
export const searchSite = async (query: string): Promise<SearchResponse> => {
	const q = query.trim()
	if (!q) return EMPTY_SEARCH_RESPONSE

	try {
		const docs = await loadIndex()
		const { words, test } = makeMatcher(q)
		const articles = docs.filter(d => d.isArticle)

		const articleHits = articles
			.filter(d => test(d.title) || test(d.description))
			.slice(0, LIMITS.articles)
			.map(d => ({ title: d.title, href: d.href, description: d.description || undefined }))

		const textHits = docs
			.filter(d => test(d.body))
			.slice(0, LIMITS.texts)
			.map(d => ({ title: d.title, href: d.href, snippet: makeSnippet(d.body, words) }))

		const seriesMap = new Map<
			string,
			{ name: string; description: string; categorySlug?: string; count: number }
		>()
		for (const d of articles) {
			if (!d.series) continue
			const entry = seriesMap.get(d.series.slug) ?? {
				name: d.series.name,
				description: d.series.description,
				count: 0,
			}
			entry.count++
			if (!entry.categorySlug && d.category) entry.categorySlug = getCategorySlug(d.category)
			seriesMap.set(d.series.slug, entry)
		}
		const seriesHits = [...seriesMap.entries()]
			.filter(([, s]) => s.categorySlug && (test(s.name) || test(s.description)))
			.slice(0, LIMITS.series)
			.map(([slug, s]) => ({
				name: s.name,
				href: `/blog/${s.categorySlug}/series/${slug}`,
				description: s.description || undefined,
				count: s.count,
			}))

		const tagMap = new Map<string, SearchTagHit>()
		for (const d of articles) {
			for (const tag of d.tags) {
				if (!test(tag)) continue
				const key = norm(tag)
				const entry = tagMap.get(key) ?? { name: tag, articles: [] }
				if (entry.articles.length < LIMITS.tagArticles) {
					entry.articles.push({ title: d.title, href: d.href })
				}
				tagMap.set(key, entry)
			}
		}
		const tagHits = [...tagMap.values()].slice(0, LIMITS.tags)

		const pageHits = docs
			.filter(d => !d.isArticle && (test(d.title) || test(d.description)))
			.slice(0, LIMITS.pages)
			.map(d => ({ title: d.title, href: d.href, description: d.description || undefined }))

		return {
			articles: articleHits,
			texts: textHits,
			series: seriesHits,
			tags: tagHits,
			pages: pageHits,
		}
	} catch (error) {
		console.error('Error searching site:', error)
		return EMPTY_SEARCH_RESPONSE
	}
}
