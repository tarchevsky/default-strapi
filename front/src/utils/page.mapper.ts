import {
	BlockquoteComponent,
	DynamicComponent,
	FeaturedPostsComponent,
	HeroBlockComponent,
	ImgComponent,
	ParagraphComponent,
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
			Container: typeof item.Container === 'boolean' ? item.Container : undefined,
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
		const quote =
			item.BlockquoteText ??
			item.Quote ??
			item.quote ??
			''
		const caption =
			item.BlockquoteSubtext ??
			item.Caption ??
			item.caption ??
			null
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
					Img?: {
						id: number
						url: string
						alternativeText?: string | null
						caption?: string | null
						name?: string
					} | null
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

		return {
			__component: 'blocks.hero',
			id: item.id,
			image: imageComponent?.Img ?? null,
			title: String(titleComponent?.Heading ?? ''),
			subtitle:
				subtitleComponent?.Paragraph != null
					? String(subtitleComponent.Paragraph)
					: null,
		} satisfies HeroBlockComponent
	}

	return item as DynamicComponent
}

export const mapStrapiPageToPage = (strapiPage: StrapiPage): Page => {
	const rawDynamic = (strapiPage.Dynamic || []) as StrapiDynamicItem[]
	return {
		id: strapiPage.id,
		documentId: strapiPage.documentId,
		title: strapiPage.Title,
		description: strapiPage.Description,
		slug: strapiPage.Slug,
		typeOfPage: strapiPage.TypeOfPage,
		category: strapiPage.Category,
		dynamic: rawDynamic.map(mapStrapiDynamicItem),
		createdAt: strapiPage.createdAt,
		updatedAt: strapiPage.updatedAt,
		publishedAt: strapiPage.publishedAt,
	}
}
