/** Найденная статья или страница (совпадение по заголовку/описанию) */
export interface SearchArticleHit {
	title: string
	href: string
	description?: string
}

/** Совпадение в тексте статьи — со сниппетом вокруг найденного */
export interface SearchTextHit {
	title: string
	href: string
	snippet: string
}

/** Найденная серия статей */
export interface SearchSeriesHit {
	name: string
	href: string
	description?: string
	count: number
}

/** Найденный тег и статьи с ним */
export interface SearchTagHit {
	name: string
	articles: { title: string; href: string }[]
}

/** Ответ /api/search: разделы в порядке показа, пустые не показываются */
export interface SearchResponse {
	articles: SearchArticleHit[]
	texts: SearchTextHit[]
	series: SearchSeriesHit[]
	tags: SearchTagHit[]
	pages: SearchArticleHit[]
}

export const EMPTY_SEARCH_RESPONSE: SearchResponse = {
	articles: [],
	texts: [],
	series: [],
	tags: [],
	pages: [],
}
