import type { StepsPairComponent } from '@/types/dynamic.types'
import { MarkdownRenderer } from './MarkdownRenderer'
import FadeIn from './ui/FadeIn'

interface StepsTimelineProps {
	pairs: StepsPairComponent[]
}

function stripHtmlToText(input: string): string {
	// Для Strapi richtext при наличии только пустых тегов нужно отсеять “пустой контент”
	return input.replace(/<[^>]*>/g, '').trim()
}

export const StepsTimeline = ({ pairs }: StepsTimelineProps) => {
	const visiblePairs = pairs.filter(pair => {
		const title = pair.StepTitle?.trim() ?? ''
		const stepText = pair.StepText?.toString() ?? ''
		return Boolean(title) || Boolean(stepText ? stripHtmlToText(stepText) : '')
	})

	return (
		<FadeIn className='cont'>
			<ul className='timeline timeline-snap-icon max-md:timeline-compact timeline-vertical'>
				{visiblePairs.map((pair, index) => {
					const title = pair.StepTitle?.trim() ?? ''
					const stepTextRaw = pair.StepText?.toString() ?? ''
					const stepTextHasContent = Boolean(
						stepTextRaw ? stripHtmlToText(stepTextRaw) : '',
					)
					const caption = pair.StepCaption?.trim() ?? ''

					const hasTitleOrText = Boolean(title) || stepTextHasContent
					const showCaption = Boolean(caption) && hasTitleOrText

					const hrBefore = index !== 0
					const hrAfter = index !== visiblePairs.length - 1

					const isLeft = index % 2 === 0

					return (
						<li key={pair.id ?? index}>
							{hrBefore && <hr />}

							<div className='timeline-middle'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									className='h-5 w-5'
								>
									<path
										fillRule='evenodd'
										d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
										clipRule='evenodd'
									/>
								</svg>
							</div>

							<div
								className={
									isLeft
										? 'timeline-start mb-10 md:text-end'
										: 'timeline-end md:mb-10'
								}
							>
								{showCaption && (
									<time className='font-mono italic'>{caption}</time>
								)}

								{title && <div className='text-lg font-black'>{title}</div>}

								{stepTextHasContent && (
									<MarkdownRenderer
										content={stepTextRaw}
										useCont={false}
										useInd={false}
										className='mt-2 prose-sm max-w-none'
									/>
								)}
							</div>

							{hrAfter && <hr />}
						</li>
					)
				})}
			</ul>
		</FadeIn>
	)
}
