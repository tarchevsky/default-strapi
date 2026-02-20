// Layout.tsx + FadeIn.tsx

import { ReactNode } from 'react'

export interface LayoutProps {
	tag?: 'div' | 'section' | 'main' | 'header' | 'footer' | 'article'
	children: ReactNode
	className?: string
	delay?: number
	style?: string
}

export interface HeroProps {
	title?: string
	src: string
	buttonText?: string
	alt: string
	subtitle?: string
	unoptimized?: boolean
	heroContentClassName?: string
	imgClassName?: string
	slider?: boolean
	text1?: string
	textLink1?: string
	text2?: string
	textLink2?: string
	text3?: string
	textLink3?: string
	text4?: string
	textLink4?: string
}
