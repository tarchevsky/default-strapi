import { DynamicComponent } from './dynamic.types'

export interface StrapiPageAttributes {
	Title: string
	Description: string
	Slug: string
	Dynamic: Array<{
		__component: string
		id: number
		[key: string]: unknown
	}>
}

export interface StrapiPage {
	id: number
	documentId: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	Title: string
	Description: string
	Slug: string
	Dynamic: Array<{
		__component: string
		id: number
		[key: string]: unknown
	}>
}

export interface StrapiPagesResponse {
	data: StrapiPage[]
	meta: {
		pagination: {
			page: number
			pageSize: number
			pageCount: number
			total: number
		}
	}
}

export interface Page {
	id: number
	documentId: string
	title: string
	description: string
	slug: string
	dynamic: DynamicComponent[]
	createdAt: string
	updatedAt: string
	publishedAt: string
}
