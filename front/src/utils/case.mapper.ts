import { Case } from '@/types/case.types'
import { DynamicComponent } from '@/types/dynamic.types'
import { StrapiMedia } from '@/types/media.types'

interface StrapiCaseData {
	id: number
	documentId: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	Title: string
	Description: string
	Slug: string
	Announce: string | null
	dynamic?: unknown[]
	CaseImage?: StrapiMedia | null
}

export const mapStrapiCaseToCase = (item: StrapiCaseData): Case => ({
	id: item.id,
	documentId: item.documentId,
	createdAt: item.createdAt,
	updatedAt: item.updatedAt,
	publishedAt: item.publishedAt,
	title: item.Title,
	description: item.Description,
	slug: item.Slug,
	announce: item.Announce || '',
	dynamic: (item.dynamic || []) as DynamicComponent[],
	caseImage: item.CaseImage || null,
})
