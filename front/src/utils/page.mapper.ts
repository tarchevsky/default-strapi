import {
	BlockquoteComponent,
	DynamicComponent,
	FeaturedPostsComponent,
	FeaturedSeriesComponent,
	HeroBlockComponent,
	HeroImage,
	ImgComponent,
	ParagraphComponent,
	StepsPairComponent,
	StepsStepsComponent,
} from '@/types/dynamic.types'
import { Page, StrapiPage } from '@/types/page.types'

/** Сырой блок из Strapi (поля могут прийти в разном регистре) */
type StrapiDynamicItem = {
	__component: string
	id: number
	[key: string]: unknown
}

function mapStrapiDynamicItem(item: StrapiDynamicItem): DynamicComponent {
	if (item.__component === 'text.paragraph') {
		return {
			__component: 'text.paragraph',
			id: item.id,
			Paragraph: String(item.Paragraph ?? ''),
			Container:
				typeof item.Container === 'boolean' ? item.Container : undefined,
			Indent: typeof item.Indent === 'boolean' ? item.Indent : undefined,
		} satisfies ParagraphComponent
	}
	if (item.__component === 'interactivity.featured-posts') {
		return {
			__component: 'interactivity.featured-posts',
			id: item.id,
			FeaturedPosts: Boolean(item.FeaturedPosts),
		} satisfies FeaturedPostsComponent
	}
	if (item.__component === 'interactivity.featured-series') {
		return {
			__component: 'interactivity.featured-series',
			id: item.id,
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
			id: item.id,
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
			id: item.id,
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
			id: item.id,
			image,
			title: String(titleComponent?.Heading ?? ''),
			subtitle:
				subtitleComponent?.Paragraph != null
					? String(subtitleComponent.Paragraph)
					: null,
		} satisfies HeroBlockComponent
	}

	if (item.__component === 'steps.steps') {
		const rawPairs = (item.Pair ?? item.pair) as unknown
		const pairs = Array.isArray(rawPairs)
			? rawPairs.map(p => {
					const pair = p as Record<string, unknown>
					return {
						__component: 'steps.pair',
						id: (pair.id as number) ?? 0,
						StepTitle: String(
							pair.StepTitle ?? pair.stepTitle ?? pair.Steptitle ?? '',
						),
						StepText: String(
							pair.StepText ??
								pair.stepText ??
								pair.steptext ??
								pair.Steptext ??
								'',
						),
						StepCaption: String(
							pair.StepCaption ??
								pair.stepCaption ??
								pair.stepcaption ??
								pair.Stepcaption ??
								'',
						),
					} satisfies StepsPairComponent
				})
			: []

		return {
			__component: 'steps.steps',
			id: item.id,
			Pair: pairs,
		} satisfies StepsStepsComponent
	}

	return item as DynamicComponent
}

/** Читает атрибут из ответа Strapi (PascalCase или lowercase) */
function strapiAttr<T>(raw: Record<string, unknown>, ...keys: string[]): T | undefined {
	for (const k of keys) {
		const v = raw[k]
		if (v !== undefined && v !== null) return v as T
	}
	return undefined
}

export const mapStrapiPageToPage = (strapiPage: StrapiPage): Page => {
	const raw = strapiPage as unknown as Record<string, unknown>
	const rawDynamic = (raw.Dynamic ?? raw.dynamic ?? []) as StrapiDynamicItem[]
	const seriesRaw = (raw.Series ?? raw.series) as Record<string, unknown> | null | undefined
	const tagsRaw = (raw.Tags ?? raw.tags) as Array<{ Name?: string; name?: string }> | undefined
	const seriesSlug =
		typeof seriesRaw?.SeriesSlug === 'string'
			? seriesRaw.SeriesSlug
			: typeof seriesRaw?.seriesSlug === 'string'
				? seriesRaw.seriesSlug
				: undefined
	return {
		id: (raw.id as number) ?? strapiPage.id,
		documentId: (raw.documentId as string) ?? strapiPage.documentId,
		title: String(strapiAttr<string>(raw, 'Title', 'title') ?? ''),
		description: String(strapiAttr<string>(raw, 'Description', 'description') ?? ''),
		slug: String(strapiAttr<string>(raw, 'Slug', 'slug') ?? ''),
		typeOfPage: strapiAttr(raw, 'TypeOfPage', 'typeOfPage') as Page['typeOfPage'],
		category: strapiAttr(raw, 'Category', 'category') as Page['category'],
		seriesSlug,
		seriesOrder: strapiAttr(raw, 'SeriesOrder', 'seriesOrder') as number | undefined,
		tags: Array.isArray(tagsRaw) ? tagsRaw.map(t => t?.Name ?? t?.name ?? '').filter(Boolean) : [],
		dynamic: rawDynamic.map(mapStrapiDynamicItem),
		createdAt: String(raw.createdAt ?? strapiPage.createdAt),
		updatedAt: String(raw.updatedAt ?? strapiPage.updatedAt),
		publishedAt: String(raw.publishedAt ?? strapiPage.publishedAt),
	}
}
