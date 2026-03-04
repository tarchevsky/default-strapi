'use client'

import Burger from '@/components/burger/Burger'
import { ContactsAndSocials } from '@/components/ContactsAndSocials'
import { Logo } from '@/components/Logo'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import SearchInput from '@/components/SearchInput'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { DEFAULT_HEADER, getHeader } from '@/services/header.service'
import { Header as HeaderType } from '@/types/header.types'
import cn from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Header.module.scss'

interface HeaderProps {
	headerData?: HeaderType
}

const Header = ({ headerData }: HeaderProps) => {
	const [isMenuActive, setIsMenuActive] = useState(false)
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [header, setHeader] = useState<HeaderType | null>(headerData || null)
	const [isLoading, setIsLoading] = useState(!headerData)
	const searchWrapRef = useRef<HTMLDivElement>(null)
	const searchInputRef = useRef<HTMLInputElement>(null)

	const toggleMenu = () => {
		setIsMenuActive(!isMenuActive)
	}

	useBodyScrollLock(isMenuActive)

	useEffect(() => {
		if (!headerData) {
			const fetchHeader = async () => {
				try {
					setIsLoading(true)
					const headerData = await getHeader()
					setHeader(headerData)
				} catch (error) {
					console.error('Ошибка при загрузке хедера:', error)
				} finally {
					setIsLoading(false)
				}
			}

			fetchHeader()
		}
	}, [headerData])

	// Закрывать мобильное меню при переходе на md+
	useEffect(() => {
		const mq = window.matchMedia('(min-width: 768px)')
		const handler = () => {
			if (mq.matches) setIsMenuActive(false)
		}
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	}, [])

	useEffect(() => {
		if (isSearchOpen) searchInputRef.current?.focus()
	}, [isSearchOpen])

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				searchWrapRef.current &&
				!searchWrapRef.current.contains(e.target as Node)
			) {
				setIsSearchOpen(false)
			}
		}
		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [])

	const toggleSearch = useCallback(() => setIsSearchOpen(v => !v), [])

	// Сортируем меню по order (создаём копию, чтобы не мутировать оригинал)
	const sortedMenu = header?.menu
		? [...header.menu].sort((a, b) => a.order - b.order)
		: []

	const hasMenu = isLoading
		? DEFAULT_HEADER.menu.length > 0
		: sortedMenu.length > 0

	const menuItems = isLoading
		? [...DEFAULT_HEADER.menu].sort((a, b) => a.order - b.order)
		: sortedMenu

	return (
		<header
			className={cn(
				styles.header,
				'relative z-40 cont flex gap-4 items-center justify-center  py-5',
			)}
		>
			{/* Логотип */}
			<div className='flex-shrink-0'>
				{header?.textLogo ? (
					<Link
						href='/'
						className='text-logo-block [&_.text-logo-heading]:font-bold [&_p]:m-0 [&_p]:leading-tight'
					>
						<MarkdownRenderer
							content={header.textLogo}
							useCont={false}
							useInd={false}
						/>
					</Link>
				) : (
					<>
						<div className='md:hidden'>
							<Logo logo={header?.logoMob || header?.logo} />
						</div>
						<div className='hidden md:block'>
							<Logo logo={header?.logo} />
						</div>
					</>
				)}
			</div>

			{/* Десктоп: навигация */}
			<nav className='hidden md:flex gap-4 h-full sm:ml-[86px] py-1 flex-1 min-w-0'>
				<ul className='menu p-0 flex flex-row justify-center items-end flex-1 min-w-0'>
					{menuItems.map(item => (
						<li
							key={item.id}
							className={cn(styles.item, 'flex justify-center h-full')}
						>
							<Link
								className='px-[10px] py-0  transition-opacity ease-out duration-150 hover:bg-transparent hover:opacity-80'
								href={item.url ?? '#'}
							>
								{item.label}
							</Link>
						</li>
					))}
				</ul>
				<div
					ref={searchWrapRef}
					className='flex flex-shrink-0 items-center gap-1 overflow-hidden min-h-[3.5rem]'
				>
					<button
						type='button'
						onClick={toggleSearch}
						className='btn btn-ghost btn-sm btn-circle shrink-0'
						aria-label={isSearchOpen ? 'Закрыть поиск' : 'Открыть поиск'}
						aria-expanded={isSearchOpen}
					>
						<Search className='size-5' />
					</button>
					<AnimatePresence initial={false}>
						{isSearchOpen && (
							<motion.div
								initial={{ width: 0, opacity: 0 }}
								animate={{ width: 224, opacity: 1 }}
								transition={{ type: 'spring', stiffness: 400, damping: 35 }}
								exit={{
									width: 0,
									opacity: 0,
									transition: { duration: 0.2, ease: 'easeOut' },
								}}
								className='overflow-hidden min-w-0 flex items-center p-2'
							>
								<div className='w-52 shrink-0'>
									<SearchInput
										ref={searchInputRef}
										inputClassName='input input-bordered w-full input-sm rounded-full pr-10 placeholder:opacity-60 border border-base-300'
										aria-label='Поиск'
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</nav>

			{/* Десктоп: контакты и соцсети */}
			<div className='hidden md:flex flex-shrink-0 items-center'>
				{(header?.contacts?.tel ||
					header?.contacts?.email ||
					(header?.socials && header.socials.length > 0)) && (
					<ContactsAndSocials
						contacts={header?.contacts}
						socials={header?.socials}
					/>
				)}
			</div>

			{/* Мобильное меню (раскрывающееся) */}
			{hasMenu && (
				<>
					<AnimatePresence>
						{isMenuActive && (
							<motion.div
								className='md:hidden absolute top-full left-0 right-0 z-50 cont bg-base-100 border-t border-base-300 shadow-lg overflow-hidden'
								initial={{ opacity: 0, maxHeight: 0 }}
								animate={{
									opacity: 1,
									maxHeight: '80vh',
									transition: {
										maxHeight: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
										opacity: { duration: 0.2 },
									},
								}}
								exit={{
									opacity: 0,
									maxHeight: 0,
									transition: {
										maxHeight: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
										opacity: { duration: 0.18 },
									},
								}}
							>
								<nav className='p-4' aria-label='Мобильное меню'>
									<ul className='flex flex-col gap-0 list-none p-0 m-0'>
										{menuItems.map((item, i) => (
											<li key={item.id}>
												<motion.div
													initial={{ opacity: 0, x: -8 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{
														delay: 0.05 + i * 0.03,
														duration: 0.2,
													}}
												>
													<Link
														href={item.url ?? '#'}
														className='block py-3 text-base font-medium transition-opacity hover:opacity-70'
														onClick={() => setIsMenuActive(false)}
													>
														{item.label}
													</Link>
												</motion.div>
											</li>
										))}
									</ul>
									{(header?.contacts?.tel ||
										header?.contacts?.email ||
										(header?.socials && header.socials.length > 0)) && (
										<motion.div
											className='pt-3 mt-3 border-t border-base-300 flex flex-wrap items-center gap-3'
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.15 + menuItems.length * 0.03 }}
										>
											<ContactsAndSocials
												contacts={header?.contacts}
												socials={header?.socials}
											/>
										</motion.div>
									)}
								</nav>
							</motion.div>
						)}
					</AnimatePresence>
					<Burger
						isActive={isMenuActive}
						toggleMenu={toggleMenu}
						className='md:hidden'
					/>
				</>
			)}
		</header>
	)
}

export default Header
