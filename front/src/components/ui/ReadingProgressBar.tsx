 'use client'

import { useEffect, useState } from 'react'

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value))

const ReadingProgressBar = () => {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const handleScroll = () => {
			const { scrollTop, scrollHeight } = document.documentElement
			const viewportHeight = window.innerHeight || 0
			const maxScrollable = scrollHeight - viewportHeight

			if (maxScrollable <= 0) {
				setProgress(0)
				return
			}

			const next = (scrollTop / maxScrollable) * 100
			setProgress(clamp(next, 0, 100))
		}

		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('resize', handleScroll)

		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleScroll)
		}
	}, [])

	return (
		<div className='pointer-events-none fixed inset-x-0 top-0 z-[60] h-0'>
			<div className='h-[3px] w-full overflow-hidden bg-gray-100/80'>
				<div
					className='h-full bg-gray-400 transition-[width] duration-150 ease-out'
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	)
}

export default ReadingProgressBar

