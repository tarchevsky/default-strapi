import { STRAPI_URL } from '@/constants/admin.constant'
import { Header, StrapiHeader } from '@/types/header.types'

export const mapStrapiHeaderToHeader = (strapiHeader: StrapiHeader): Header => {
	const getAbsoluteUrl = (url: string): string => {
		if (url.startsWith('http')) return url
		return `${STRAPI_URL}${url}`
	}

	return {
		logo: strapiHeader.Logo
			? {
					url: getAbsoluteUrl(strapiHeader.Logo.url),
					alt: strapiHeader.Logo.alternativeText || 'Logo',
			  }
			: undefined,
		menu: Array.isArray(strapiHeader.Menu)
			? strapiHeader.Menu.map(item => ({
					order: item.Order,
					id: item.id,
					url: item.Url,
					label: item.MenuItem,
			  }))
			: [],
		socials: Array.isArray(strapiHeader.Socials)
			? strapiHeader.Socials.map(social => ({
					id: social.id,
					link: social.Link,
					iconName: social.SingleIconText,
			  }))
			: [],
		contacts: {
			tel: strapiHeader.Tel
				? {
						value: strapiHeader.Tel.Tel,
						href: strapiHeader.Tel.link,
				  }
				: undefined,
			email: strapiHeader.Email
				? {
						value: strapiHeader.Email.Email,
						href: strapiHeader.Email.EmailLink,
				  }
				: undefined,
		},
	}
}
