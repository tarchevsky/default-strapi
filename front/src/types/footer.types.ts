import { StrapiMedia } from './media.types'

export interface StrapiFooter {
	id: number
	documentId: string
	Company_details?: string | null
	Text?: string | null
	Logo?: StrapiMedia | null
}

export interface Footer {
	companyDetails: string
	text: string
	logo: {
		url: string
		alt: string
	} | null
}
