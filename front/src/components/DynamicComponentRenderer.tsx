import { STRAPI_URL } from '@/constants/admin.constant'
import {
	DynamicComponent,
	GridIconItem,
	GridWidth,
	HeroBlockComponent,
} from '@/types/dynamic.types'
import { ArticleListItem } from '@/types/page.types'
import Image from 'next/image'
import type { JSX } from 'react'
import { Blockquote } from './Blockquote'
import Hero from './Hero'
import { IconRenderer } from './IconRenderer'
import { MarkdownRenderer } from './MarkdownRenderer'
import FeaturedPostsCarousel from './ui/carousel/FeaturedPostsCarousel'

interface DynamicComponentRendererProps {
	component: DynamicComponent
	featuredArticles?: ArticleListItem[]
	metaTitle?: string
}

export const DynamicComponentRenderer = ({
	component,
	featuredArticles,
	metaTitle,
}: DynamicComponentRendererProps) => {
	switch (component.__component) {
		case 'text.heading': {
			const HeadingTag = component.headinglevel
			return (
				<HeadingTag className='font-bold mb-2'>{component.Heading}</HeadingTag>
			)
		}
		case 'text.paragraph':
			return (
				<MarkdownRenderer
					content={component.Paragraph}
					useCont={component.Container === true}
					useInd={component.Indent === true}
				/>
			)
		case 'text.blockquote':
			return (
				<Blockquote
					quote={component.Quote}
					caption={component.Caption}
					fullPage={component.FullPage !== false}
				/>
			)
		case 'text.title': {
			const isOn = component.OnOff !== false
			if (!isOn) return null
			const title =
				(component.Title?.trim()?.length ? component.Title : metaTitle) || ''
			return (
				<h1 className='cont text-xl md:text-2xl font-bold mb-3 md:mb-4 text-right'>{title}</h1>
			)
		}
		case 'decorative.line': {
			const isOn = component.OnOff !== false
			if (!isOn) return null
			const Indentations = component.Indentations || ''
			return (
				<div
					className={`${
						component.Container === true ? 'cont ' : ''
					}h-0.5 bg-[#893829] w-full`}
					{...(Indentations && { style: { margin: `${Indentations}px 0` } })}
				/>
			)
		}
		case 'img.img': {
			const img = component.Img
			if (!img || !img.url) return null

			const src = img.url.startsWith('http')
				? img.url
				: `${STRAPI_URL}${img.url}`
			const alt = img.alternativeText || ''
			const wrapWithContainer = component.Container === true
			const wrapWithInd = component.Indent === true
			const withBox = component.Box === true
			const shouldShowCaption = component.Caption === true
			const captionText =
				img.caption ||
				img.alternativeText ||
				img.name ||
				''
			const imageEl = (
				<Image
					src={src}
					alt={alt}
					width={img.width}
					height={img.height}
					className='rounded-3xl'
					style={{ maxWidth: '100%', height: '100%' }}
				/>
			)
			const galleryWrapped = withBox ? (
				<a
					href={src}
					data-fancybox='page-gallery'
					{...(shouldShowCaption && captionText
						? { 'data-caption': captionText }
						: {})}
					className='block w-full h-full'
				>
					{imageEl}
				</a>
			) : (
				imageEl
			)
			const content = (
				<>
					{galleryWrapped}
					{shouldShowCaption && captionText ? <p>{captionText}</p> : null}
				</>
			)
			return wrapWithContainer && wrapWithInd ? (
				<div className='cont ind'>{content}</div>
			) : wrapWithContainer ? (
				<div className='cont'>{content}</div>
			) : wrapWithInd ? (
				<div className='ind'>{content}</div>
			) : (
				content
			)
		}
		case 'interactivity.featured-posts':
			if (!component.FeaturedPosts || !featuredArticles?.length) return null
			return <FeaturedPostsCarousel articles={featuredArticles} />
		case 'blocks.hero': {
			const hero = component as HeroBlockComponent
			const img = hero.image
			if (!img || !img.url) return null

			const src = img.url.startsWith('http')
				? img.url
				: `${STRAPI_URL}${img.url}`
			const alt =
				img.alternativeText ||
				img.caption ||
				img.name ||
				hero.title ||
				''

			const title = hero.title?.trim() || ''
			const subtitle = hero.subtitle?.trim() || undefined

			return (
				<Hero
					title={title}
					src={src}
					alt={alt}
					subtitle={subtitle}
				/>
			)
		}
		case 'layout.grid': {
			const gapPx = (component.Gap ?? 0) * 8

			const widthTokenToClass = (width?: GridWidth) => {
				switch (width) {
					case 'w-1-4':
						return 'w-1/4'
					case 'w-1-3':
						return 'w-1/3'
					case 'w-1-2':
						return 'w-1/2'
					case 'w-2-3':
						return 'w-2/3'
					case 'w-3-4':
						return 'w-3/4'
					case 'w-fit':
						return 'w-fit'
					case 'w-min':
						return 'w-min'
					case 'w-max':
						return 'w-max'
					case 'w-1-1':
					default:
						return 'w-full'
				}
			}

			const buildWidthClasses = (
				desktopWidth?: GridWidth,
				mobileWidth?: GridWidth,
			) => {
				const mobileClass = mobileWidth
					? widthTokenToClass(mobileWidth)
					: 'w-full'
				const desktopClass = widthTokenToClass(desktopWidth)

				if (mobileClass === desktopClass && !mobileWidth) {
					return mobileClass
				}

				return `${mobileClass} md:${desktopClass}`
			}

			// Map justify values to Tailwind classes
			const justifyToTw = (j: string | undefined) => {
				switch (j) {
					case 'start':
						return 'justify-start'
					case 'end':
						return 'justify-end'
					case 'center':
						return 'justify-center'
					case 'between':
						return 'justify-between'
					default:
						return ''
				}
			}

			// Map align values to Tailwind classes
			const alignToTw = (a: string | undefined) => {
				switch (a) {
					case 'start':
						return 'items-start'
					case 'end':
						return 'items-end'
					case 'center':
						return 'items-center'
					case 'stretch':
						return 'items-stretch'
					default:
						return ''
				}
			}

			// Map direction values to Tailwind classes
			const directionToTw = (d: string | undefined) => {
				switch (d) {
					case 'row':
						return 'flex-row'
					case 'column':
					default:
						return 'flex-col'
				}
			}

			const buildWrapClasses = (
				mobWrap?: boolean | null,
				wrap?: boolean | null,
			) => {
				const classes: string[] = ['flex']

				if (mobWrap === true) {
					classes.push('flex-wrap')
				} else if (mobWrap === false) {
					classes.push('flex-nowrap')
				}

				if (wrap === true) {
					classes.push('md:flex-wrap')
				} else if (wrap === false) {
					classes.push('md:flex-nowrap')
				}

				return classes.join(' ')
			}

			const containerClasses = [
				component.Container !== false && 'cont',
				buildWrapClasses(component.MobWrap, component.Wrap),
				component.Indent === true && 'ind',
			]
				.filter(Boolean)
				.join(' ')
			return (
				<div className={containerClasses} style={{ gap: `${gapPx}px` }}>
					{component.Columns?.map(col => {
						const renderIconContent = (iconData: GridIconItem) => {
							const iconName = iconData.SingleIconText?.trim()
							if (iconName) {
								return <IconRenderer iconName={iconName} className='w-6 h-6' />
							}

							const iconMedia = iconData.SingleIcon
							if (iconMedia?.url) {
								const src = iconMedia.url.startsWith('http')
									? iconMedia.url
									: `${STRAPI_URL}${iconMedia.url}`
								const alt =
									iconMedia.alternativeText ||
									iconMedia.caption ||
									iconMedia.name ||
									'icon'

								return (
									<Image
										src={src}
										alt={alt}
										width={iconMedia.width}
										height={iconMedia.height}
										className='w-6 h-6 object-contain rounded-3xl'
									/>
								)
							}

							return null
						}

						const baseClasses = buildWidthClasses(col.Width, col.MobWidth)
						const flexClasses = [justifyToTw(col.Justify), alignToTw(col.Align)]
							.filter(Boolean)
							.join(' ')

						// Determine flex direction - default to flex-col
						const flexDirection = directionToTw(col.Direction)

						const columnClasses = flexClasses
							? `${baseClasses} flex ${flexDirection} ${flexClasses}`
							: `${baseClasses} flex ${flexDirection}`

						return (
							<div key={col.id} className={columnClasses}>
								{/* Img(s) */}
								{Array.isArray(col.Img) &&
									col.Img.map(item => {
										const img = item?.Img
										if (!img || !img.url) return null
										const src = img.url.startsWith('http')
											? img.url
											: `${STRAPI_URL}${img.url}`
										const alt = img.alternativeText || ''
										const shouldShowCaption = item?.Caption === true
										const captionText =
											img.caption ||
											img.alternativeText ||
											img.name ||
											''
										const shouldUseBox = item?.Box === true

										if (shouldUseBox) {
											const fancyboxImageClasses = [
												'h-full object-cover transition-all duration-300 ease-in rounded-3xl',
												component.Indent === true && 'ind',
											]
												.filter(Boolean)
												.join(' ')
											return (
												<div key={item.id}>
													<a
														href={src}
														data-fancybox='page-gallery'
														{...(shouldShowCaption && captionText
															? { 'data-caption': captionText }
															: {})}
														className='block w-full h-full'
													>
														<Image
															src={src}
															alt={alt}
															width={img.width}
															height={img.height}
															style={{ width: '100%' }}
															className={fancyboxImageClasses}
														/>
													</a>
													{shouldShowCaption && captionText ? (
														<p>{captionText}</p>
													) : null}
												</div>
											)
										}

										return (
											<div key={item.id}>
												<Image
													src={src}
													alt={alt}
													width={img.width}
													height={img.height}
													style={{ width: '100%' }}
													className='h-full object-cover transition-all duration-300 ease-in rounded-3xl'
												/>
												{shouldShowCaption && captionText ? (
													<p>{captionText}</p>
												) : null}
											</div>
										)
									})}

								{/* Heading(s) */}
								{Array.isArray(col.Heading) &&
									col.Heading.map(h => {
										const Tag = h.headinglevel as keyof JSX.IntrinsicElements
										return (
											<Tag key={h.id} className='text-base md:text-lg font-semibold mb-2'>
												{h.Heading}
											</Tag>
										)
									})}

								{/* Paragraph(s) */}
								{Array.isArray(col.Paragraph) &&
									col.Paragraph.map(p => (
										<MarkdownRenderer
											key={p.id}
											content={p.Paragraph}
											useCont={p.Container === true}
										/>
									))}

								{/* Icon(s) */}
								{Array.isArray(col.Icon) && col.Icon.length > 0 && (
									<div className='flex flex-wrap gap-3'>
										{col.Icon.map((iconItem, index) => {
											const iconContent = renderIconContent(iconItem)
											if (!iconContent) return null

											const key = iconItem.id ?? `${col.id}-icon-${index}`
											const href = iconItem.Link?.trim()
											const wrapperClasses =
												'inline-flex items-center justify-center'

											return href ? (
												<a
													key={key}
													href={href}
													target='_blank'
													rel='noopener noreferrer'
													className={wrapperClasses}
												>
													{iconContent}
												</a>
											) : (
												<span key={key} className={wrapperClasses}>
													{iconContent}
												</span>
											)
										})}
									</div>
								)}
							</div>
						)
					})}
				</div>
			)
		}
		default:
			return null
	}
}
