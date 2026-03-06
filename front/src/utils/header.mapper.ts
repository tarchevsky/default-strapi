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

/** Читает атрибут из ответа Strapi 5 (PascalCase или lowercase) */
function attr<T>(raw: Record<string, unknown>, ...keys: string[]): T | undefined {
	for (const k of keys) {
		const v = raw[k]
		if (v !== undefined && v !== null) return v as T
	}
	return undefined
}

export const mapStrapiHeaderToHeader = (strapiHeader: StrapiHeader): Header => {
	const raw = strapiHeader as unknown as Record<string, unknown>
	const getAbsoluteUrl = (url: string): string => {
		if (url.startsWith('http')) return url
		return `${STRAPI_URL}${url}`
	}

	const logo = (raw.Logo ?? raw.logo) as { url?: string; alternativeText?: string } | undefined
	const logoMob = (raw.LogoMob ?? raw.logoMob) as { url?: string; alternativeText?: string } | undefined
	const logoWidth = attr<number>(raw, 'LogoWidth', 'logoWidth')
	const logoHeight = attr<number>(raw, 'LogoHeight', 'logoHeight')
	const logoMobWidth = attr<number>(raw, 'LogoMobWidth', 'logoMobWidth')
	const logoMobHeight = attr<number>(raw, 'LogoMobHeight', 'logoMobHeight')

	const textLogo = mapTextLogo(
		(raw.TextLogo ?? raw.textLogo) as
			| string
			| StrapiRichTextBlock[]
			| { content?: StrapiRichTextBlock[] }
			| null
			| undefined,
	)

	const menuRaw = (raw.Menu ?? raw.menu) as Array<{
		id?: number
		Order?: number
		order?: number
		Url?: string
		url?: string
		MenuItem?: string
		menuItem?: string
	}> | undefined
	const menu = Array.isArray(menuRaw)
		? menuRaw.map(item => ({
				order: item.Order ?? item.order ?? 0,
				id: item.id ?? 0,
				url: item.Url ?? item.url ?? '/',
				label: item.MenuItem ?? item.menuItem ?? '',
		  }))
		: []

	const socialsRaw = (raw.Socials ?? raw.socials) as Array<{
		id?: number
		Link?: string
		link?: string
		SingleIconText?: string
		singleIconText?: string
		IconWidth?: number
		IconHeight?: number
	}> | undefined
	const socials = Array.isArray(socialsRaw)
		? socialsRaw.map(social => ({
				id: social.id ?? 0,
				link: social.Link ?? social.link ?? '',
				iconName: social.SingleIconText ?? social.singleIconText ?? '',
				width: social.IconWidth ?? undefined,
				height: social.IconHeight ?? undefined,
		  }))
		: []

	const tel = (raw.Tel ?? raw.tel) as { Tel?: string; tel?: string; link?: string } | undefined
	const email = (raw.Email ?? raw.email) as {
		Email?: string
		email?: string
		EmailLink?: string
		emailLink?: string
	} | undefined

	return {
		logo:
			logo && logo.url
				? {
						url: getAbsoluteUrl(logo.url),
						alt: logo.alternativeText || 'Logo',
						width: logoWidth ?? undefined,
						height: logoHeight ?? undefined,
				  }
				: undefined,
		logoMob:
			logoMob && logoMob.url
				? {
						url: getAbsoluteUrl(logoMob.url),
						alt: logoMob.alternativeText || 'Logo mobile',
						width: logoMobWidth ?? undefined,
						height: logoMobHeight ?? undefined,
				  }
				: undefined,
		textLogo,
		menu,
		socials,
		contacts: {
			tel: tel
				? { value: tel.Tel ?? tel.tel ?? '', href: tel.link ?? '#' }
				: undefined,
			email: email
				? {
						value: email.Email ?? email.email ?? '',
						href: email.EmailLink ?? email.emailLink ?? '#',
				  }
				: undefined,
		},
	}
}
