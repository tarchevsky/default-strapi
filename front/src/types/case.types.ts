import { DynamicComponent } from './dynamic.types'
import { StrapiMedia } from './media.types'

export interface Case {
	id: number
	documentId: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	title: string
	description: string
	slug: string
	announce: string
	dynamic: DynamicComponent[]
	caseImage: StrapiMedia | null
}
