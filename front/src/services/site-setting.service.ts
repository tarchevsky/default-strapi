import { STRAPI_URL } from '@/constants/admin.constant'
import { StrapiSiteSettingResponse } from '@/types/site-setting.types'
import axios from 'axios'

export const getSiteSetting =
	async (): Promise<StrapiSiteSettingResponse | null> => {
		try {
			// Пробуем получить данные напрямую без fallback логики для 404
			const response = await axios.get(
				`${STRAPI_URL}/api/site-setting?populate=*`,
				{
					timeout: 8000,
				}
			)

			if (!response.data.data) {
				console.log('Site-setting не содержит данных')
				return null
			}

			return response.data
		} catch (error) {
			// Любая ошибка (404, 500 и т.д.) - site-setting просто не настроен, это нормально
			if (axios.isAxiosError(error)) {
				console.log('Site-setting не настроен или недоступен:', error.response?.status || 'неизвестная ошибка')
				return null
			}

			console.log('Ошибка при получении настроек сайта:', error)
			// Возвращаем null если API недоступен
			return null
		}
	}
