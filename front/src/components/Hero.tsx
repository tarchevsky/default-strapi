'use client'

import Modal from '@/components/modal/Modal'
import type { ModalHandle } from '@/components/modal/modal.types'
import FadeIn from '@/components/ui/FadeIn'
import type { HeroProps, ModalContentProps } from '@/types/types'
import Image from 'next/image'
import React, { useRef, useState } from 'react'

const Hero = ({
	title,
	alt,
	subtitle,
	src,
	unoptimized,
	modalContent,
	closeIcon,
}: HeroProps) => {
	const modalRef = useRef<ModalHandle>(null)
	const [modalMessage, setModalMessage] = useState<string | null>(null)

	const handleSuccess = (message: string) => {
		setModalMessage(message)
	}

	const handleModalClose = () => {
		setModalMessage(null)
	}

	const renderModalContent = () => {
		if (modalMessage) {
			return <p className='py-4'>{modalMessage}</p>
		}
		if (React.isValidElement(modalContent)) {
			const element = modalContent as React.ReactElement<ModalContentProps>
			return React.cloneElement(element, {
				onSuccess: handleSuccess,
				closeIcon: closeIcon,
			})
		}
		return modalContent
	}

	return (
		<FadeIn tag='main' className='hero my-12 md:my-20'>
			<div className='max-w-3xl mx-auto flex flex-col items-center text-center gap-6 md:flex-row md:text-left md:gap-0'>
				<Image
					className='w-[220px] h-[220px] md:w-[300px] md:h-[300px] object-cover rounded-full shrink-0 shadow-2xl'
					src={src}
					alt={alt}
					width={300}
					height={300}
					priority
					unoptimized={unoptimized}
				/>
				<div className='z-10 md:-ml-16'>
					<h1 className='text-4xl md:text-7xl font-extrabold text-slate-800'>
						{title}
					</h1>
					{subtitle ? (
						<p className='mt-2 text-base md:text-lg text-slate-700'>
							{subtitle}
						</p>
					) : null}
				</div>
			</div>
			{modalContent && (
				<Modal ref={modalRef} onClose={handleModalClose} closeIcon={closeIcon}>
					{renderModalContent()}
				</Modal>
			)}
		</FadeIn>
	)
}

export default Hero
