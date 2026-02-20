// Carousel

export interface SlidesProps {
	id: number
	src: string
	alt: string
	title: string
	description: string
}

export interface CarouselProps {
	slides: SlidesProps[]
	navigationPosition?: 'side' | 'bottom'
	paginationPosition?: 'inside' | 'outside'
	height?: {
		mobile?: string
		desktop?: string
	}
	sideNavWidth?: {
		mobile?: string
		desktop?: string
	}
	bottomNav?: {
		marginBottom?: {
			mobile?: string
			desktop?: string
		}
		arrowsOffset?: {
			mobile?: string
			desktop?: string
		}
	}
	pagination?: {
		offset?: {
			mobile?: string
			desktop?: string
		}
	}
	arrows?: {
		size?: {
			mobile?: string
			desktop?: string
		}
		iconSize?: {
			mobile?: string
			desktop?: string
		}
	}
}
