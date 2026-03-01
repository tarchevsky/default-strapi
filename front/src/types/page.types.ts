import { DynamicComponent } from './dynamic.types'

/** Значения enum TypeOfPage из Strapi */
export type TypeOfPage = 'блог' | 'статья'

/** Категории для типа страницы «статья» (enum Category в Strapi) */
export type PageCategory =
	| 'Методические материалы'
	| 'Глоссарий'
	| 'Статья'

/** Все категории статей — для фильтров, селектов, меток */
export const PAGE_CATEGORIES: PageCategory[] = [
	'Методические материалы',
	'Глоссарий',
	'Статья',
]

/** Маппинг категория → URL-слаг для /blog/[category]/[slug]. Добавление новой категории: + запись сюда. */
export const CATEGORY_SLUG_MAP: Record<PageCategory, string> = {
	'Методические материалы': 'metodika',
	Глоссарий: 'glossary',
	Статья: 'article',
}

const SLUG_TO_CATEGORY = Object.fromEntries(
	(Object.entries(CATEGORY_SLUG_MAP) as [PageCategory, string][]).map(
		([cat, slug]) => [slug, cat]
	)
) as Record<string, PageCategory>

export function getCategorySlug(category: PageCategory): string {
	return CATEGORY_SLUG_MAP[category]
}

export function getCategoryBySlug(slug: string): PageCategory | undefined {
	return SLUG_TO_CATEGORY[slug]
}

/** Результат поиска страниц и статей (для поиска в хедере/блоге) */
export interface SearchResultItem {
	title: string
	slug: string
	/** Готовый href: /slug для страницы, /blog/categorySlug/slug для статьи */
	href: string
	type: 'page' | 'article'
}

/** Элемент списка статей для сайдбара/ленты и блока избранного */
export interface ArticleListItem {
	title: string
	slug: string
	/** Краткое описание (для блока избранного) */
	description?: string
	category?: PageCategory
	/** URL-слаг категории для ссылки /blog/[categorySlug]/[slug] */
	categorySlug?: string
}

export interface StrapiPageAttributes {
	Title: string
	Description: string
	Slug: string
	TypeOfPage?: TypeOfPage
	/** Условное поле при TypeOfPage === 'статья' */
	Category?: PageCategory
	Dynamic: Array<{
		__component: string
		id: number
		[key: string]: unknown
	}>
}

export interface StrapiPage {
	id: number
	documentId: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	Title: string
	Description: string
	Slug: string
	TypeOfPage?: TypeOfPage
	Category?: PageCategory
	Dynamic: Array<{
		__component: string
		id: number
		[key: string]: unknown
	}>
}

export interface StrapiPagesResponse {
	data: StrapiPage[]
	meta: {
		pagination: {
			page: number
			pageSize: number
			pageCount: number
			total: number
		}
	}
}

export interface Page {
	id: number
	documentId: string
	title: string
	description: string
	slug: string
	typeOfPage?: TypeOfPage
	/** При typeOfPage === 'статья' */
	category?: PageCategory
	dynamic: DynamicComponent[]
	createdAt: string
	updatedAt: string
	publishedAt: string
}
