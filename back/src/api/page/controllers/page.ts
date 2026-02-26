/**
 * page controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::page.page', ({ strapi }) => ({
	async search(ctx) {
		const q = String(ctx.query?.q ?? '').trim()
		if (!q) {
			return { data: [], meta: { pagination: { page: 1, pageSize: 15, pageCount: 0, total: 0 } } }
		}
		const result = (await strapi.documents('api::page.page').findMany({
			filters: { Title: { $containsi: q } },
			fields: ['Title', 'Slug', 'TypeOfPage', 'Category'],
			limit: 15,
			start: 0,
			status: 'published',
		})) as unknown as { documents?: unknown[]; meta?: { pagination?: unknown } } | unknown[]
		const documents = Array.isArray(result) ? result : (result?.documents ?? [])
		const meta = Array.isArray(result) ? null : result?.meta
		return {
			data: documents,
			meta: meta ?? { pagination: { page: 1, pageSize: 15, pageCount: documents.length ? 1 : 0, total: documents.length } },
		}
	},
}))
