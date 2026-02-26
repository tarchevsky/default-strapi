import { Case, CaseService } from '@/types/case.types'
import { DynamicComponent } from '@/types/dynamic.types'
import { StrapiMedia } from '@/types/media.types'

interface StrapiCaseData {
	id?: number
	documentId?: string
	createdAt?: string
	updatedAt?: string
	publishedAt?: string
	Title?: string
	Description?: string
	Slug?: string
	Services?: CaseService | null
	dynamic?: unknown[]
	CaseImage?: StrapiMedia | null
	PopupImage?: StrapiMedia | null
	Process?: string | null
	Materials?: string | null
}

const hasMediaUrl = (m: StrapiMedia | null | undefined): m is StrapiMedia =>
	!!m && typeof (m as StrapiMedia).url === 'string' && (m as StrapiMedia).url !== ''

export const mapStrapiCaseToCase = (item: StrapiCaseData | null | undefined): Case => {
	if (!item) {
		return {
			id: 0,
			documentId: '',
			createdAt: '',
			updatedAt: '',
			publishedAt: '',
			title: '',
			description: '',
			slug: '',
			popupImage: null,
			process: '',
			materials: '',
			services: undefined,
			dynamic: [],
			caseImage: null,
		}
	}
	return {
		id: item.id ?? 0,
		documentId: item.documentId ?? '',
		createdAt: item.createdAt ?? '',
		updatedAt: item.updatedAt ?? '',
		publishedAt: item.publishedAt ?? '',
		title: item.Title ?? '',
		description: item.Description ?? '',
		slug: item.Slug ?? '',
		popupImage: hasMediaUrl(item.PopupImage) ? item.PopupImage : null,
		process: item.Process ?? '',
		materials: item.Materials ?? '',
		services: item.Services ?? undefined,
		dynamic: (item.dynamic || []) as DynamicComponent[],
		caseImage: hasMediaUrl(item.CaseImage) ? item.CaseImage : null,
	}
}
