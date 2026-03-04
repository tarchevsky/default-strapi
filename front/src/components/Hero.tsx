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
			{/* Мобильная: колонка, картинка сверху, текст по центру снизу */}
			<div className='cont flex flex-col items-center text-center gap-6 md:hidden'>
				<Image
					className='w-[220px] h-[220px] object-cover rounded-full shrink-0 shadow-2xl'
					src={src}
					alt={alt}
					width={220}
					height={220}
					priority
					unoptimized={unoptimized}
				/>
				<div>
					<h1 className='text-4xl font-extrabold text-slate-800'>{title}</h1>
					{subtitle ? (
						<p className='mt-2 text-base text-slate-700'>{subtitle}</p>
					) : null}
				</div>
			</div>
			{/* Десктоп: первоначальная версия — круг слева, заголовок справа с наездом */}
			<div className='max-w-3xl mx-auto hidden md:flex md:items-center md:gap-0'>
				<Image
					className='w-[300px] h-[300px] object-cover rounded-full shrink-0 shadow-2xl'
					src={src}
					alt={alt}
					width={300}
					height={300}
					priority
					unoptimized={unoptimized}
				/>
				<div className='-ml-16 z-10 relative'>
					{/* Базовый текст — тёмный (виден справа от круга) */}
					<div className='text-slate-800'>
						<h1 className='text-5xl md:text-7xl font-extrabold [text-shadow:0_1px_2px_rgba(0,0,0,0.08)]'>
							{title}
						</h1>
						{subtitle ? (
							<p className='mt-2 text-slate-700 [text-shadow:0_1px_2px_rgba(0,0,0,0.06)]'>
								{subtitle}
							</p>
						) : null}
					</div>
					{/* Светлый текст только в зоне соприкосновения с кругом (clip по форме фото) */}
					<div
						className='absolute inset-0 text-white pointer-events-none'
						style={{
							clipPath: 'circle(150px at -86px 50%)',
							mixBlendMode: 'screen',
						}}
					>
						<h1 className='text-5xl md:text-7xl font-extrabold [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]'>
							{title}
						</h1>
						{subtitle ? (
							<p className='mt-2 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]'>
								{subtitle}
							</p>
						) : null}
					</div>
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
