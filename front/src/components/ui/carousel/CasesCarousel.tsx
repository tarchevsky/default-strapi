'use client'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'

import Btn from '@/components/ui/Btn'
import Modal from '@/components/ui/Modal'
import { STRAPI_URL } from '@/constants/admin.constant'
import { USE_CUSTOM_CAROUSEL_ARROWS } from '@/constants/carousel.constant'
import { Case } from '@/types/case.types'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import FadeIn from '../FadeIn'
import styles from './CasesCarousel.module.scss'

interface CasesCarouselProps {
	cases: Case[]
}

const CasesCarousel = ({ cases }: CasesCarouselProps) => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedCase, setSelectedCase] = useState<Case | null>(null)

	const handleCaseClick = (caseItem: Case) => {
		setSelectedCase(caseItem)
		setIsModalOpen(true)
	}

	// Группируем кейсы: 6 для десктопа, 2 для мобильной
	const desktopSlidesData = []
	for (let i = 0; i < cases.length; i += 6) {
		desktopSlidesData.push(cases.slice(i, i + 6))
	}

	const mobileSlidesData = []
	for (let i = 0; i < cases.length; i += 2) {
		mobileSlidesData.push(cases.slice(i, i + 2))
	}

	return (
		<>
			<div className='bg-blue-950'>
				{/* Мобильная версия */}
				<FadeIn className='block md:hidden'>
					<Swiper
						slidesPerView={1}
						spaceBetween={30}
						loop={mobileSlidesData.length > 1}
						pagination={false}
						navigation={true}
						modules={[Pagination, Navigation]}
						className={`cases-carousel${USE_CUSTOM_CAROUSEL_ARROWS ? ' cases-carousel--custom-arrows' : ''}`}
					>
						{mobileSlidesData.map((slideCases, slideIndex) => (
							<SwiperSlide key={slideIndex}>
								<div className='flex flex-col gap-4 py-[55px] px-10'>
									{slideCases.map(caseItem => (
										<div
											key={caseItem.id}
											className={styles.caseItem}
											onClick={() => handleCaseClick(caseItem)}
										>
											<div className='relative aspect-[3/2] overflow-hidden'>
												{caseItem.caseImage ? (
													<Image
														src={`${STRAPI_URL}${caseItem.caseImage.url}`}
														alt={
															caseItem.caseImage.alternativeText ||
															caseItem.title
														}
														fill
														sizes='100vw'
														className='object-cover group-hover:scale-105 transition-transform duration-300'
													/>
												) : (
													<div className='w-full h-full bg-gray-200 flex items-center justify-center'>
														<span className='text-gray-400'>
															Нет изображения
														</span>
													</div>
												)}
												<div className={styles.overlay}>
													<h3 className={styles.title}>{caseItem.title}</h3>
												</div>
											</div>
										</div>
									))}
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</FadeIn>

				{/* Десктопная версия */}
				<FadeIn className='hidden md:block'>
					<Swiper
						slidesPerView={1}
						spaceBetween={50}
						loop={desktopSlidesData.length > 1}
						pagination={false}
						navigation={true}
						modules={[Pagination, Navigation]}
						className={`cases-carousel${USE_CUSTOM_CAROUSEL_ARROWS ? ' cases-carousel--custom-arrows' : ''}`}
					>
						{desktopSlidesData.map((slideCases, slideIndex) => (
							<SwiperSlide key={slideIndex}>
								<div className='grid grid-cols-3 gap-[50px] py-[50px] px-32'>
									{slideCases.map(caseItem => (
										<div
											key={caseItem.id}
											className={styles.caseItem}
											onClick={() => handleCaseClick(caseItem)}
										>
											<div className='relative aspect-[3/2] overflow-hidden'>
												{caseItem.caseImage ? (
													<Image
														src={`${STRAPI_URL}${caseItem.caseImage.url}`}
														alt={
															caseItem.caseImage.alternativeText ||
															caseItem.title
														}
														fill
														sizes='33vw'
														className='object-cover group-hover:scale-105 transition-transform duration-300'
													/>
												) : (
													<div className='w-full h-full bg-gray-200 flex items-center justify-center'>
														<span className='text-gray-400'>
															Нет изображения
														</span>
													</div>
												)}
												<div className={styles.overlay}>
													<h3 className={styles.title}>{caseItem.title}</h3>
												</div>
											</div>
										</div>
									))}
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</FadeIn>
			</div>
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				width='max-w-[1078px]'
			>
				{selectedCase && (
					<>
						<h2 className='text-xl font-bold text-center uppercase'>
							{selectedCase.title}
						</h2>
						<div className='grid grid-cols-[774px_1fr] gap-[15px]'>
							<div className='flex shrink-0'>
								<div className='w-[18px] shrink-0 bg-[#002B49]' />
								<div className='relative w-[756px] h-[504px] overflow-hidden'>
									{selectedCase.popupImage ? (
										<Image
											src={`${STRAPI_URL}${selectedCase.popupImage.url}`}
											alt={
												selectedCase.popupImage.alternativeText ||
												selectedCase.title
											}
											fill
											className='object-cover'
										/>
									) : (
										<div className='w-full h-full bg-gray-200 flex items-center justify-center'>
											<span className='text-gray-400'>Нет изображения</span>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col text-[21.33px] text-[#0F4271]'>
								<span className='font-semibold'>Материалы:</span>
								<div className='mt-[15px]'>
									<MarkdownRenderer
										content={selectedCase.materials}
										useCont={false}
									/>
								</div>
								<div className='mt-[92px]'>
									<span className='font-semibold'>Процессы:</span>
									<div className='mt-[15px]'>
										<MarkdownRenderer
											content={selectedCase.process}
											useCont={false}
										/>
									</div>
								</div>
							</div>
						</div>
						<div className='mt-6'>
							<Link href={`/cases/${selectedCase.slug}`}>
								<Btn text='Подробнее' />
							</Link>
						</div>
					</>
				)}
			</Modal>
		</>
	)
}

export default CasesCarousel
