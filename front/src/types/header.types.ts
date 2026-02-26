// Тип для медиа-файла из Strapi
interface StrapiMedia {
	id: number
	documentId: string
	name: string
	alternativeText?: string | null
	caption?: string | null
	width: number
	height: number
	formats?: unknown | null
	hash: string
	ext: string
	mime: string
	size: number
	url: string
	previewUrl?: string | null
	provider: string
	provider_metadata?: unknown | null
	createdAt: string
	updatedAt: string
	publishedAt: string
}

// Тип для меню-айтема
interface MenuItem {
	Order: number
	id: number
	Url: string
	MenuItem: string
}

// Тип для социальной иконки
interface SocialIcon {
	id: number
	Link: string
	SingleIconText: string
}

// Strapi Rich Text (Blocks) — один узел
export type StrapiRichTextBlock =
	| { type: string; text?: string; children?: StrapiRichTextBlock[]; [k: string]: unknown }
	| string

// Тип для сырых данных хеддера из Strapi
export interface StrapiHeader {
	id: number
	documentId: string
	createdAt: string
	updatedAt: string
	publishedAt: string
	Logo?: StrapiMedia | null
	LogoMob?: StrapiMedia | null
	TextLogo?: string | StrapiRichTextBlock[] | { content?: StrapiRichTextBlock[] } | null
	Menu: MenuItem[]
	Socials: SocialIcon[]
	Tel?: {
		id: number
		Tel: string
		link: string
	}
	Email?: {
		id: number
		Email: string
		EmailLink: string
	}
}

// Тип для преобразованного хеддера
export interface Header {
	logo?: {
		url: string
		alt: string
	}
	logoMob?: {
		url: string
		alt: string
	}
	/** HTML-строка логотипа (Rich Text с бэкенда) */
	textLogo?: string | null
	menu: Array<{
		order: number
		id: number
		url: string
		label: string
	}>
	socials: Array<{
		id: number
		link: string
		iconName: string
	}>
	contacts: {
		tel?: {
			value: string
			href: string
		}
		email?: {
			value: string
			href: string
		}
	}
}
