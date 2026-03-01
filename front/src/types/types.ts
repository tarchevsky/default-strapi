// Layout.tsx + FadeIn.tsx

import { ReactNode } from 'react'

export interface LayoutProps {
	tag?: 'div' | 'section' | 'main' | 'header' | 'footer' | 'article'
	children: ReactNode
	className?: string
	delay?: number
	style?: string
}

export interface ModalContentProps {
	onSuccess?: (message: string) => void
	closeIcon?: boolean
}

export interface HeroProps {
	title: string
	src: string
	alt: string
	buttonText?: string
	subtitle?: string
	unoptimized?: boolean
	modalContent?: ReactNode | React.ReactElement<ModalContentProps>
	closeIcon?: boolean
	config?: 'center' | 'cover'
}
