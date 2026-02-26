import { StrapiMedia } from './media.types'

export interface HeadingComponent {
	__component: 'text.heading'
	id: number
	headinglevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
	Heading: string
}

export interface ParagraphComponent {
	__component: 'text.paragraph'
	id: number
	Paragraph: string
	Container?: boolean
	Indent?: boolean
}

export interface TitleComponent {
	__component: 'text.title'
	id: number
	OnOff?: boolean
	Title?: string
}

export interface ImgComponent {
	__component: 'img.img'
	id: number
	Img: StrapiMedia
	Container?: boolean
	Indent?: boolean
	Box?: boolean
}

export interface IconComponent {
	__component: 'img.icon'
	id: number
	SingleIcon?: StrapiMedia | null
	Link?: string | null
	SingleIconText?: string | null
}

export interface LineComponent {
	__component: 'decorative.line'
	id: number
	OnOff?: boolean
	Container?: boolean
	Indentations?: string
}

/** Совпадает с CaseService в case.types — какой сервис показывать в карусели */
export type CasesCarouselService = 'упаковка' | 'полиграфия'

export interface CasesCarouselComponent {
	__component: 'interactivity.cases-carousel'
	id: number
	OnOff: boolean
	/** Показывать только кейсы с этим сервисом; без значения — все кейсы */
	Service?: CasesCarouselService | null
}

export type GridWidth =
	| 'w-1-4'
	| 'w-1-3'
	| 'w-1-2'
	| 'w-2-3'
	| 'w-3-4'
	| 'w-1-1'
	| 'w-fit'
	| 'w-min'
	| 'w-max'

export type GridJustify = 'start' | 'end' | 'center' | 'between'

export type GridAlign = 'start' | 'end' | 'center' | 'stretch'

export type GridDirection = 'column' | 'row'

// Элементы внутри колонок Grid не содержат __component в ответе Strapi,
// поэтому используем Pick от базовых компонент без этого поля
export type GridHeading = Pick<
	HeadingComponent,
	'id' | 'Heading' | 'headinglevel'
>
export type GridParagraph = Pick<
	ParagraphComponent,
	'id' | 'Paragraph' | 'Container' | 'Indent'
>
export type GridImageItem = Pick<
	ImgComponent,
	'id' | 'Img' | 'Container' | 'Indent' | 'Box'
>
export type GridIconItem = Pick<
	IconComponent,
	'id' | 'SingleIcon' | 'SingleIconText' | 'Link'
>

export interface GridColumn {
	id: number
	Width: GridWidth
	MobWidth?: GridWidth
	Justify?: GridJustify
	Align?: GridAlign
	Direction?: GridDirection
	Img: GridImageItem[]
	Heading: GridHeading[]
	Paragraph: GridParagraph[]
	Icon?: GridIconItem[]
}

export interface GridComponent {
	__component: 'layout.grid'
	id: number
	Gap: number
	Container?: boolean
	Indent?: boolean
	Columns: GridColumn[]
	Wrap?: boolean
	MobWrap?: boolean
}

export type DynamicComponent =
	| HeadingComponent
	| ParagraphComponent
	| CasesCarouselComponent
	| ImgComponent
	| IconComponent
	| GridComponent
	| TitleComponent
	| LineComponent
