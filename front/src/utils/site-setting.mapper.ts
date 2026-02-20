import { STRAPI_URL } from '@/constants/admin.constant'
import {
	SiteSetting,
	StrapiSiteSettingResponse,
} from '@/types/site-setting.types'

export const mapSiteSetting = (
	response: StrapiSiteSettingResponse | null
): SiteSetting => {
	if (!response?.data) {
		return {
			favicon: null,
			appleFavicon: null,
		}
	}

	const { data } = response

	return {
		favicon: data.Favicon ? `${STRAPI_URL}${data.Favicon.url}` : null,
		appleFavicon: data.AppleFavicon
			? `${STRAPI_URL}${data.AppleFavicon.url}`
			: null,
	}
}
