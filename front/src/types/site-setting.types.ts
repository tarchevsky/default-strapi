export interface StrapiImage {
	id: number
	documentId: string
	name: string
	alternativeText: string | null
	caption: string | null
	width: number
	height: number
	formats: {
		thumbnail?: {
			ext: string
			url: string
			hash: string
			mime: string
			name: string
			path: string | null
			size: number
			width: number
			height: number
			sizeInBytes: number
		}
	} | null
	hash: string
	ext: string
	mime: string
	size: number
	url: string
	previewUrl: string | null
	provider: string
	provider_metadata: string | null
	createdAt: string
	updatedAt: string
	publishedAt: string
}

export interface StrapiSiteSetting {
	id: number
	documentId: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	Favicon: StrapiImage | null
	AppleFavicon: StrapiImage | null
}

export interface StrapiSiteSettingResponse {
	data: StrapiSiteSetting
	meta: Record<string, unknown>
}

export interface SiteSetting {
	favicon: string | null
	appleFavicon: string | null
}
