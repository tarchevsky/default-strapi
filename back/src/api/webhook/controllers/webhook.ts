/**
 * webhook controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController(
	'api::webhook.webhook',
	({ strapi }) => ({
		async trigger(ctx) {
			const { contentType, action, data } = ctx.request.body

			try {
				// Отправляем webhook на Next.js приложение
				await strapi.service('api::webhook.webhook').sendWebhook({
					contentType,
					action,
					data,
					timestamp: new Date().toISOString(),
				})

				ctx.body = { success: true, message: 'Webhook отправлен' }
			} catch (error) {
				strapi.log.error('Ошибка отправки webhook:', error)
				ctx.status = 500
				ctx.body = { success: false, error: error.message }
			}
		},
	})
)
