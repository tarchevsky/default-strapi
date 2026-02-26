import { STRAPI_URL } from '@/constants/admin.constant'
import {
	Header,
	StrapiHeader,
	StrapiRichTextBlock,
} from '@/types/header.types'

function richTextBlocksToHtml(blocks: StrapiRichTextBlock[]): string {
	const render = (node: StrapiRichTextBlock): string => {
		if (typeof node === 'string') return node
		const text = (node.children ?? [])
			.map(child => render(child))
			.join('')
		switch (node.type) {
			case 'paragraph':
				return text ? `<p>${text}</p>` : ''
			case 'heading':
				return text ? `<span class="text-logo-heading">${text}</span>` : ''
			case 'text':
				return node.text ?? ''
			default:
				return text
		}
	}
	return blocks.map(b => render(b)).join('')
}

function mapTextLogo(
	raw: string | StrapiRichTextBlock[] | { content?: StrapiRichTextBlock[] } | null | undefined,
): string | null {
	if (raw == null) return null
	if (typeof raw === 'string') return raw.trim() || null
	const blocks = Array.isArray(raw)
		? raw
		: (raw && 'content' in raw && Array.isArray(raw.content) ? raw.content : [])
	if (blocks.length > 0) {
		const html = richTextBlocksToHtml(blocks)
		return html.trim() || null
	}
	return null
}

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
		logoMob: strapiHeader.LogoMob
			? {
					url: getAbsoluteUrl(strapiHeader.LogoMob.url),
					alt: strapiHeader.LogoMob.alternativeText || 'Logo mobile',
			  }
			: undefined,
		textLogo: mapTextLogo(strapiHeader.TextLogo),
		menu: Array.isArray(strapiHeader.Menu)
			? strapiHeader.Menu.map(item => ({
					order: item.Order,
					id: item.id,
					url: item.Url ?? '/',
					label: item.MenuItem ?? '',
			  }))
			: [],
		socials: Array.isArray(strapiHeader.Socials)
			? strapiHeader.Socials.map(social => ({
					id: social.id,
					link: social.Link ?? '',
					iconName: social.SingleIconText ?? '',
			  }))
			: [],
		contacts: {
			tel: strapiHeader.Tel
				? {
						value: strapiHeader.Tel.Tel,
						href: strapiHeader.Tel.link ?? '#',
				  }
				: undefined,
			email: strapiHeader.Email
				? {
						value: strapiHeader.Email.Email,
						href: strapiHeader.Email.EmailLink ?? '#',
				  }
				: undefined,
		},
	}
}
