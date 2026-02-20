import FullSlider from '@/components/fullSlider/FullSlider'
import { HeroProps } from '@/types/types'

import Image from 'next/image'
import Link from 'next/link'

const Hero = ({
	title,
	buttonText,
	alt,
	subtitle,
	src,
	unoptimized,
	heroContentClassName,
	imgClassName,
	slider = false,
	text1,
	text2,
	text3,
	text4,
	textLink1,
	textLink2,
	textLink3,
	textLink4,
}: HeroProps) => {
	return (
		<div className='hero'>
			<div
				className={`relative w-full max-w-full hero-content flex-col-reverse items-start lg:items-center lg:flex-row ${heroContentClassName}`}
			>
				<Image
					className={`absolute top-0 left-0 w-full object-cover ${imgClassName}`}
					src={src}
					alt={alt}
					width={1400}
					height={770}
					priority
					unoptimized={unoptimized}
				/>
				{slider ? <FullSlider /> : null}
				{title ? (
					<div className='grid md:relative z-10 md:min-w-[900px]'>
						<div className='flex flex-col md:items-center'>
							<h1 className='text-5xl md:text-9xl text-base-100 px-6 md:px-0'>
								{title}
							</h1>
							{subtitle ? (
								<p className='text-base-100 text-2xl md:text-5xl px-6 md:px-0'>
									{subtitle}
								</p>
							) : null}
						</div>
						{text1 ? (
							<div className='grid lg:grid-cols-2 gap-4 mt-[33px]'>
								<div className='rounded-3xl p-6 glass'>
									{textLink1 ? (
										<Link
											href={textLink1}
											className='text-base-100'
											dangerouslySetInnerHTML={{ __html: text1 ?? '' }}
											aria-label='Кнопка на раздел'
										/>
									) : (
										<div
											className='text-base-100'
											dangerouslySetInnerHTML={{ __html: text1 ?? '' }}
										/>
									)}
								</div>
								<div className='rounded-3xl p-6 glass'>
									{textLink2 ? (
										<Link
											href={textLink2}
											className='text-base-100'
											dangerouslySetInnerHTML={{ __html: text2 ?? '' }}
											aria-label='Кнопка на раздел'
										/>
									) : (
										<div
											className='text-base-100'
											dangerouslySetInnerHTML={{ __html: text2 ?? '' }}
										/>
									)}
								</div>
								<div className='rounded-3xl p-6 glass'>
									{textLink3 ? (
										<Link
											href={textLink3}
											className='text-base-100'
											dangerouslySetInnerHTML={{ __html: text3 ?? '' }}
											aria-label='Кнопка на раздел'
										/>
									) : (
										<div
											className='text-base-100'
											dangerouslySetInnerHTML={{ __html: text3 ?? '' }}
										/>
									)}
								</div>
								<div className='rounded-3xl p-6 glass'>
									{textLink4 ? (
										<Link
											href={textLink4}
											className='text-base-100'
											dangerouslySetInnerHTML={{ __html: text4 ?? '' }}
											aria-label='Кнопка на раздел'
										/>
									) : (
										<div
											className='text-base-100'
											dangerouslySetInnerHTML={{ __html: text4 ?? '' }}
										/>
									)}
								</div>
							</div>
						) : null}

						{buttonText ? (
							<button className='btn btn-primary btn-lg mt-3'>
								{buttonText}
							</button>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	)
}

export default Hero
