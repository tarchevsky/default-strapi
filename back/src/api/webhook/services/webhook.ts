/**
 * webhook service
 */

import { factories } from '@strapi/strapi'
import axios from 'axios'

export default factories.createCoreService(
	'api::webhook.webhook',
	({ strapi }) => ({
		async sendWebhook(payload: {
			contentType: string
			action: string
			data: any
			timestamp: string
		}) {
			const { contentType, action, data, timestamp } = payload

			// Полный URL Next.js обработчика webhook
			const webhookUrl =
				process.env.NEXTJS_WEBHOOK_URL || 'http://localhost:3000/api/revalidate'

			const maxRetries = 3
			const baseDelay = 1000 // 1 секунда

			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					await axios.post(
						webhookUrl,
						{
							contentType,
							action,
							data,
							timestamp,
							secret: process.env.WEBHOOK_SECRET || 'default-secret',
						},
						{
							timeout: 15000, // 15 секунд для продакшена
							headers: {
								'Content-Type': 'application/json',
							},
						}
					)

					strapi.log.info(
						`Webhook отправлен для ${contentType}:${action} (попытка ${attempt})`
					)
					return // Успешно отправлен, выходим из цикла
				} catch (error) {
					const isLastAttempt = attempt === maxRetries

					if (isLastAttempt) {
						strapi.log.error(
							`Ошибка отправки webhook после ${maxRetries} попыток:`,
							error
						)
						throw error
					} else {
						const delay = baseDelay * attempt // Экспоненциальная задержка
						strapi.log.warn(
							`Попытка ${attempt} неудачна, повтор через ${delay}мс:`,
							error.message
						)
						await new Promise(resolve => setTimeout(resolve, delay))
					}
				}
			}
		},
	})
)
