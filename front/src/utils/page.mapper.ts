import { DynamicComponent } from '@/types/dynamic.types'
import { Page, StrapiPage } from '@/types/page.types'

export const mapStrapiPageToPage = (strapiPage: StrapiPage): Page => {
	return {
		id: strapiPage.id,
		documentId: strapiPage.documentId,
		title: strapiPage.Title,
		description: strapiPage.Description,
		slug: strapiPage.Slug,
		typeOfPage: strapiPage.TypeOfPage,
		category: strapiPage.Category,
		dynamic: strapiPage.Dynamic as unknown as DynamicComponent[],
		createdAt: strapiPage.createdAt,
		updatedAt: strapiPage.updatedAt,
		publishedAt: strapiPage.publishedAt,
	}
}
