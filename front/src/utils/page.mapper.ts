import {
	BlockquoteComponent,
	DynamicComponent,
	FeaturedPostsComponent,
	FeaturedSeriesComponent,
	HeroBlockComponent,
	HeroImage,
	ImgComponent,
	ParagraphComponent,
} from '@/types/dynamic.types'
import { Page, StrapiPage } from '@/types/page.types'

/** Нормализует страницу из Strapi v4 (attributes, relation.data) или v5 (плоский формат) */
function normalizeStrapiPage(raw: unknown): StrapiPage {
	const attrs = (raw as { attributes?: Record<string, unknown> }).attributes
	const base = attrs ? { ...(raw as object), ...attrs } : (raw as Record<string, unknown>)
	const series = base.Series as Record<string, unknown> | undefined
	const tagsRaw = base.Tags as
		| Array<{ id?: number; Name?: string; attributes?: { Name?: string } }>
		| { data?: Array<{ id?: number; Name?: string; attributes?: { Name?: string } }> }
		| undefined
	let tags: Array<{ id: number; Name: string }> = []
	if (Array.isArray(tagsRaw)) {
		tags = tagsRaw.map((t) => ({ id: t.id ?? 0, Name: t.Name ?? t.attributes?.Name ?? '' }))
	} else if (tagsRaw && Array.isArray((tagsRaw as { data?: unknown }).data)) {
		const arr = (tagsRaw as { data: Array<{ id?: number; Name?: string; attributes?: { Name?: string } }> }).data
		tags = arr.map((t) => ({ id: t.id ?? 0, Name: t.Name ?? t.attributes?.Name ?? '' }))
	}
	return {
		id: (base.id as number) ?? 0,
		documentId: (base.documentId as string) ?? String(base.id ?? ''),
		createdAt: (base.createdAt as string) ?? '',
		updatedAt: (base.updatedAt as string) ?? '',
		publishedAt: (base.publishedAt as string) ?? '',
		Title: (base.Title as string) ?? '',
		Description: (base.Description as string) ?? '',
		Slug: (base.Slug as string) ?? '',
		TypeOfPage: base.TypeOfPage as StrapiPage['TypeOfPage'],
		Category: base.Category as StrapiPage['Category'],
		SeriesOrder: base.SeriesOrder as number | undefined,
		Series: (series?.data ?? series) as StrapiPage['Series'],
		Tags: (tags.length ? tags : (Array.isArray(base.Tags) ? base.Tags : [])) as StrapiPage['Tags'],
		Dynamic: (Array.isArray(base.Dynamic) ? base.Dynamic : []) as StrapiPage['Dynamic'],
	}
}

/** Сырой блок из Strapi (поля могут прийти в разном регистре; в v5 может быть documentId вместо id) */
type StrapiDynamicItem = {
	__component: string
	id?: number
	documentId?: string
	[key: string]: unknown
}

function getComponentId(item: StrapiDynamicItem): number {
	if (typeof item.id === 'number') return item.id
	if (typeof item.documentId === 'string') return 0
	return 0
}

function mapStrapiDynamicItem(item: StrapiDynamicItem): DynamicComponent {
	const id = getComponentId(item)
	if (item.__component === 'text.paragraph') {
		return {
			__component: 'text.paragraph',
			id,
			Paragraph: String(item.Paragraph ?? ''),
			Container:
				typeof item.Container === 'boolean' ? item.Container : undefined,
			Indent: typeof item.Indent === 'boolean' ? item.Indent : undefined,
		} satisfies ParagraphComponent
	}
	if (item.__component === 'interactivity.featured-posts') {
		return {
			__component: 'interactivity.featured-posts',
			id,
			FeaturedPosts: Boolean(item.FeaturedPosts),
		} satisfies FeaturedPostsComponent
	}
	if (item.__component === 'interactivity.featured-series') {
		return {
			__component: 'interactivity.featured-series',
			id,
			FeaturedSeries: Boolean(item.FeaturedSeries),
		} satisfies FeaturedSeriesComponent
	}
	if (item.__component === 'img.img') {
		const img = (item.Img ?? item.img) as unknown
		const captionFlag = (item.Caption ?? item.caption) as unknown
		const containerFlag = (item.Container ?? item.container) as unknown
		const indentFlag = (item.Indent ?? item.indent) as unknown
		const boxFlag = (item.Box ?? item.box) as unknown
		return {
			__component: 'img.img',
			id,
			Img: img as ImgComponent['Img'],
			Container: typeof containerFlag === 'boolean' ? containerFlag : undefined,
			Indent: typeof indentFlag === 'boolean' ? indentFlag : undefined,
			Box: typeof boxFlag === 'boolean' ? boxFlag : undefined,
			Caption: typeof captionFlag === 'boolean' ? captionFlag : undefined,
		} satisfies ImgComponent
	}
	if (item.__component === 'text.blockquote') {
		const quote = item.BlockquoteText ?? item.Quote ?? item.quote ?? ''
		const caption =
			item.BlockquoteSubtext ?? item.Caption ?? item.caption ?? null
		const fullPage =
			item.FullPage === false || item.fullPage === false ? false : true
		return {
			__component: 'text.blockquote',
			id,
			Quote: String(quote),
			Caption: caption != null && caption !== '' ? String(caption) : null,
			FullPage: fullPage,
		} satisfies BlockquoteComponent
	}

	if (item.__component === 'blocks.hero') {
		const imageComponent = item.Image as
			| {
					Img?: HeroImage | null
			  }
			| undefined

		const titleComponent = item.Title as
			| {
					Heading?: string | null
			  }
			| undefined

		const subtitleComponent = item.Subtitle as
			| {
					Paragraph?: string | null
			  }
			| undefined

		const image = (imageComponent?.Img ?? null) as HeroImage | null

		return {
			__component: 'blocks.hero',
			id,
			image,
			title: String(titleComponent?.Heading ?? ''),
			subtitle:
				subtitleComponent?.Paragraph != null
					? String(subtitleComponent.Paragraph)
					: null,
		} satisfies HeroBlockComponent
	}

	return { ...item, id } as DynamicComponent
}

export const mapStrapiPageToPage = (strapiPage: StrapiPage): Page => {
	const rawDynamic = (strapiPage.Dynamic || []) as StrapiDynamicItem[]
	const tagsArr = Array.isArray(strapiPage.Tags) ? strapiPage.Tags : []
	const seriesData = strapiPage.Series && typeof strapiPage.Series === 'object' && !Array.isArray(strapiPage.Series) ? strapiPage.Series : null
	return {
		id: strapiPage.id,
		documentId: strapiPage.documentId,
		title: strapiPage.Title,
		description: strapiPage.Description,
		slug: strapiPage.Slug,
		typeOfPage: strapiPage.TypeOfPage,
		category: strapiPage.Category,
		seriesSlug: (seriesData as { SeriesSlug?: string } | null)?.SeriesSlug ?? undefined,
		tags: tagsArr.map((t: { Name?: string }) => t?.Name).filter(Boolean) as string[],
		dynamic: rawDynamic.map(mapStrapiDynamicItem),
		createdAt: strapiPage.createdAt,
		updatedAt: strapiPage.updatedAt,
		publishedAt: strapiPage.publishedAt,
	}
}

/** Приводит сырой ответ API к странице (поддержка v4/v5 и разного формата relations) */
export function normalizeAndMapPage(raw: unknown): Page {
	return mapStrapiPageToPage(normalizeStrapiPage(raw))
}
