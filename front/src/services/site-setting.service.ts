import { StrapiSiteSettingResponse } from '@/types/site-setting.types'
import { strapiFetch } from './strapi-fetch'

export const getSiteSetting =
	async (): Promise<StrapiSiteSettingResponse | null> => {
		const data = await strapiFetch<StrapiSiteSettingResponse>(
			'/api/site-setting?populate=*',
			{ next: { tags: ['site-setting'], revalidate: 300 } },
		)

		if (!data?.data) {
			console.log('Site-setting не настроен или недоступен')
			return null
		}

		return data
	}
