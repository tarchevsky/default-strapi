interface SectionTitleProps {
	children: React.ReactNode
}

/** Заголовок блока-ленты в dynamic (последние / избранные статьи). */
export function SectionTitle({ children }: SectionTitleProps) {
	return (
		<h2 className='cont text-xl md:text-2xl font-bold mb-3 md:mb-4'>
			{children}
		</h2>
	)
}
