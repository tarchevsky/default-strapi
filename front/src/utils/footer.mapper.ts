import { STRAPI_URL } from '@/constants/admin.constant'
import { Footer, StrapiFooter } from '@/types/footer.types'

export const mapStrapiFooterToFooter = (strapi: StrapiFooter): Footer => {
	const getAbsoluteUrl = (url: string): string =>
		url.startsWith('http') ? url : `${STRAPI_URL}${url}`

	return {
		companyDetails: strapi.Company_details ?? '',
		text: strapi.Text ?? '',
		logo: strapi.Logo
			? {
					url: getAbsoluteUrl(strapi.Logo.url),
					alt: strapi.Logo.alternativeText ?? 'Logo',
			  }
			: null,
	}
}
