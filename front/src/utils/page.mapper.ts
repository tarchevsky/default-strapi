import {
	BlockquoteComponent,
	DynamicComponent,
} from '@/types/dynamic.types'
import { Page, StrapiPage } from '@/types/page.types'

/** Сырой блок из Strapi (поля могут прийти в разном регистре) */
type StrapiDynamicItem = {
	__component: string
	id: number
	[key: string]: unknown
}

function mapStrapiDynamicItem(item: StrapiDynamicItem): DynamicComponent {
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
		return {
			__component: 'text.blockquote',
			id: item.id,
			Quote: String(quote),
			Caption: caption != null && caption !== '' ? String(caption) : null,
			FullPage: item.FullPage ?? item.fullPage ?? true,
		} satisfies BlockquoteComponent
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
