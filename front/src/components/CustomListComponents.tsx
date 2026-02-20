import { ComponentProps, ReactNode } from 'react'

interface CustomUlProps extends ComponentProps<'ul'> {
	children?: ReactNode
}

interface CustomOlProps extends ComponentProps<'ol'> {
	children?: ReactNode
}

interface CustomLiProps extends ComponentProps<'li'> {
	children?: ReactNode
}

export const CustomUl = ({ children, ...props }: CustomUlProps) => (
	<ul className='list-disc pl-6 my-4 space-y-1' {...props}>
		{children}
	</ul>
)

export const CustomOl = ({ children, ...props }: CustomOlProps) => (
	<ol className='list-decimal pl-6 my-4 space-y-1' {...props}>
		{children}
	</ol>
)

export const CustomLi = ({ children, ...props }: CustomLiProps) => (
	<li className='leading-relaxed' {...props}>
		{children}
	</li>
)
