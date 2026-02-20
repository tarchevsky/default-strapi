export interface StrapiMediaFormat {
	url: string
	width: number
	height: number
	ext?: string
	mime?: string
	name?: string
	size?: number
	path?: string | null
}

export interface StrapiMediaFormats {
	large?: StrapiMediaFormat
	medium?: StrapiMediaFormat
	small?: StrapiMediaFormat
	thumbnail?: StrapiMediaFormat
}

export interface StrapiMedia {
	id: number
	documentId: string
	name: string
	alternativeText: string | null
	caption: string | null
	width: number
	height: number
	formats?: StrapiMediaFormats
	hash?: string
	ext?: string
	mime?: string
	size?: number
	url: string
	previewUrl?: string | null
	provider?: string
	provider_metadata?: unknown | null
	createdAt?: string
	updatedAt?: string
	publishedAt?: string
}
