import { DynamicComponent } from './dynamic.types'
import { StrapiMedia } from './media.types'

/** Значения из бэка: case.Services и CasesCarousel.Service */
export type CaseService = 'упаковка' | 'полиграфия'

export interface Case {
	id: number
	documentId: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	title: string
	description: string
	slug: string
	/** Изображение в модалке (756×504) */
	popupImage: StrapiMedia | null
	/** Richtext для блока «Процессы» в модалке */
	process: string
	/** Richtext для блока «Материалы» в модалке */
	materials: string
	/** Упаковка / полиграфия — для фильтра в карусели */
	services?: CaseService | null
	dynamic: DynamicComponent[]
	caseImage: StrapiMedia | null
}
