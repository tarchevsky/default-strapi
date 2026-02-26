interface BlockquoteProps {
	quote: string
	caption?: string | null
	fullPage?: boolean
}

export const Blockquote = ({
	quote,
	caption,
	fullPage = true,
}: BlockquoteProps) => {
	if (!quote?.trim()) return null

	return (
		<section
			className={`
				relative cont flex flex-col items-center justify-center text-center
				py-16 md:py-24
				${fullPage ? 'min-h-[80vh] md:min-h-screen' : ''}
			`}
		>
			{/* Декоративная открывающая кавычка */}
			<span
				className="absolute left-[var(--cont-xs)] top-8 md:left-[var(--cont-sm)] md:top-12 text-8xl md:text-9xl font-serif text-base-content/10 select-none pointer-events-none leading-none"
				aria-hidden
			>
				«
			</span>

			<blockquote className="relative max-w-2xl md:max-w-3xl mx-auto">
				<p className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed text-base-content">
					{quote.trim()}
				</p>
				{caption?.trim() && (
					<footer className="mt-6 text-sm md:text-base text-base-content/70">
						— {caption.trim()}
					</footer>
				)}
			</blockquote>

			{/* Закрывающая кавычка */}
			<span
				className="absolute right-[var(--cont-xs)] bottom-8 md:right-[var(--cont-sm)] md:bottom-12 text-8xl md:text-9xl font-serif text-base-content/10 select-none pointer-events-none leading-none"
				aria-hidden
			>
				»
			</span>
		</section>
	)
}
