'use client'

import { useEffect } from 'react'

const GALLERY_SELECTOR = '[data-fancybox="page-gallery"]'

export const FancyboxBinder = () => {
	useEffect(() => {
		let fancyboxModule: Awaited<typeof import('@fancyapps/ui')> | null = null
		let isActive = true

		const bindGallery = async () => {
			const fancybox = await import('@fancyapps/ui')
			if (!isActive) {
				return
			}
			fancyboxModule = fancybox
			fancybox.Fancybox.bind(GALLERY_SELECTOR, {
				wheel: 'zoom',
				Images: {
					zoom: true,
					Panzoom: {
						zoom: true,
						maxScale: 4,
						wheel: 'zoom',
					},
				},
				Toolbar: {
					display: {
						left: ['infobar'],
						middle: [],
						right: [
							'zoomIn',
							'zoomOut',
							'toggle1to1',
							'slideshow',
							'fullscreen',
							'thumbs',
							'close',
						],
					},
				},
			})
		}

		void bindGallery()

		return () => {
			isActive = false
			if (fancyboxModule) {
				fancyboxModule.Fancybox.unbind(GALLERY_SELECTOR)
				fancyboxModule.Fancybox.close()
			}
		}
	}, [])

	return null
}

export default FancyboxBinder
