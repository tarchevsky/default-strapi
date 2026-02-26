import { DynamicComponent } from './dynamic.types'
import { StrapiMedia } from './media.types'

/** Значения из бэка: case.Services и CasesCarousel.Service */
export type CaseService = 'услуга 1' | 'услуга 2'

export interface Case {
	id: number
	documentId: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	title: string
	description: string
	slug: string
	/** Услуга — для фильтра в карусели */
	services?: CaseService | null
	dynamic: DynamicComponent[]
	caseImage: StrapiMedia | null
}
