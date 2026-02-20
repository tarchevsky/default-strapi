/**
 * case controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController(
	'api::case.case',
	({ strapi }) => ({
		async create(ctx) {
			const response = await super.create(ctx)

			// Отправляем webhook при создании
			if (response.data) {
				await strapi.service('api::webhook.webhook').sendWebhook({
					contentType: 'case',
					action: 'create',
					data: response.data,
					timestamp: new Date().toISOString(),
				})
			}

			return response
		},

		async update(ctx) {
			const response = await super.update(ctx)

			// Отправляем webhook при обновлении
			if (response.data) {
				await strapi.service('api::webhook.webhook').sendWebhook({
					contentType: 'case',
					action: 'update',
					data: response.data,
					timestamp: new Date().toISOString(),
				})
			}

			return response
		},

		async delete(ctx) {
			const response = await super.delete(ctx)

			// Отправляем webhook при удалении
			if (response.data) {
				await strapi.service('api::webhook.webhook').sendWebhook({
					contentType: 'case',
					action: 'delete',
					data: response.data,
					timestamp: new Date().toISOString(),
				})
			}

			return response
		},
	})
)
