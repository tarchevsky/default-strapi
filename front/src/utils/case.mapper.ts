import { Case, CaseService } from '@/types/case.types'
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
	Services?: CaseService | null
	dynamic?: unknown[]
	CaseImage?: StrapiMedia | null
	PopupImage?: StrapiMedia | null
	Process?: string | null
	Materials?: string | null
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
	popupImage: item.PopupImage || null,
	process: item.Process || '',
	materials: item.Materials || '',
	services: item.Services ?? undefined,
	dynamic: (item.dynamic || []) as DynamicComponent[],
	caseImage: item.CaseImage || null,
})
