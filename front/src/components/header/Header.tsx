'use client'

import Burger from '@/components/burger/Burger'
import { ContactsAndSocials } from '@/components/ContactsAndSocials'
import { Logo } from '@/components/Logo'
import SearchInput from '@/components/SearchInput'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { DEFAULT_HEADER, getHeader } from '@/services/header.service'
import { Header as HeaderType } from '@/types/header.types'
import cn from 'clsx'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './Header.module.scss'

interface HeaderProps {
	headerData?: HeaderType
}

const Header = ({ headerData }: HeaderProps) => {
	const [isMenuActive, setIsMenuActive] = useState(false)
	const [header, setHeader] = useState<HeaderType | null>(headerData || null)
	const [isLoading, setIsLoading] = useState(!headerData)

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
		<header className={cn(styles.header, 'relative z-40 cont items-end flex py-5')}>
			{/* Логотип */}
			<div className='flex-shrink-0'>
				{header?.textLogo ? (
					<Link
						href='/'
						className='text-logo-block [&_.text-logo-heading]:font-bold [&_p]:m-0 [&_p]:leading-tight'
						dangerouslySetInnerHTML={{ __html: header.textLogo }}
					/>
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
			<nav className='hidden md:flex h-full ml-4 sm:ml-[86px] py-1 flex-1 min-w-0'>
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
				<div className='flex flex-shrink-0 items-center ml-4 mr-1'>
					<SearchInput
						inputClassName='input input-bordered w-40 sm:w-52 input-sm rounded-full pr-10 placeholder:opacity-60 border border-base-300'
						aria-label='Поиск'
					/>
				</div>
			</nav>

			{/* Десктоп: контакты и соцсети */}
			<div className='hidden md:flex flex-shrink-0 items-center ml-4'>
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
					<div
						className={cn(
							'md:hidden absolute top-full left-0 right-0 z-50 cont bg-base-100 border-t border-base-300 shadow-lg overflow-hidden transition-[max-height] duration-300 ease-out',
							isMenuActive ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0',
						)}
					>
						<ul className='menu p-4 flex flex-col gap-2'>
							{menuItems.map(item => (
								<li key={item.id}>
									<Link
										href={item.url ?? '#'}
										className='block py-2'
										onClick={() => setIsMenuActive(false)}
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
						{(header?.contacts?.tel ||
							header?.contacts?.email ||
							(header?.socials && header.socials.length > 0)) && (
							<div className='px-4 pb-4'>
								<ContactsAndSocials
									contacts={header?.contacts}
									socials={header?.socials}
								/>
							</div>
						)}
					</div>
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
