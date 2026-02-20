import { Swiper, SwiperSlide } from 'swiper/react'
import {
	Navigation,
	Pagination,
	Autoplay,
	Mousewheel,
	EffectFade
} from 'swiper/modules'
import Image from 'next/image'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import styles from './FullSlider.module.scss'
import cn from 'clsx'
import Video from '@/components/video/Video'

const FullSlider = () => {
	return (
		<div className='mb-9 md:mb-28'>
			<Swiper
				modules={[Autoplay, Navigation, Pagination, Mousewheel, EffectFade]}
				spaceBetween={0}
				slidesPerView={1}
				navigation={true}
				pagination={{ clickable: true }}
				loop={true}
				effect={'fade'}
				className={cn(styles.fullSlider, 'fullSlider')}
			>
				<SwiperSlide>
					{/*<Image*/}
					{/*	src='/area.png'*/}
					{/*	alt='Slide 1'*/}
					{/*	width={1920}*/}
					{/*	height={800}*/}
					{/*	style={{ width: '100%', height: '100%', objectFit: 'cover' }}*/}
					{/*/>*/}
					<Video
						src='/videos/video.m4v'
						type='video/mp4'
						height={1920}
						preload='metadata'
						width={900}
						className='w-full h-full object-cover brightness-75'
					/>
				</SwiperSlide>
				<SwiperSlide>
					<Image
						src='/hero.png'
						alt='Slide 2'
						width={1920}
						height={800}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				</SwiperSlide>
			</Swiper>
		</div>
	)
}

export default FullSlider
