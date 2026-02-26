import { STRAPI_URL } from '@/constants/admin.constant'
import { Footer, StrapiFooter } from '@/types/footer.types'

export const mapStrapiFooterToFooter = (strapi: StrapiFooter | null | undefined): Footer => {
	if (!strapi) {
		return { companyDetails: '', text: '', logo: null }
	}
	const getAbsoluteUrl = (url: string): string =>
		url.startsWith('http') ? url : `${STRAPI_URL}${url}`

	const logo =
		strapi.Logo?.url != null && strapi.Logo.url !== ''
			? {
					url: getAbsoluteUrl(strapi.Logo.url),
					alt: strapi.Logo.alternativeText ?? 'Logo',
			  }
			: null

	return {
		companyDetails: strapi.Company_details ?? '',
		text: strapi.Text ?? '',
		logo,
	}
}
