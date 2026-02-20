'use client'

import Burger from '@/components/burger/Burger'
import { ContactsAndSocials } from '@/components/ContactsAndSocials'
import { Logo } from '@/components/Logo'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { DEFAULT_HEADER, getHeader } from '@/services/header.service'
import { Header as HeaderType } from '@/types/header.types'
import cn from 'clsx'
import { motion } from 'framer-motion'
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

	// Сортируем меню по order (создаём копию, чтобы не мутировать оригинал)
	const sortedMenu = header?.menu
		? [...header.menu].sort((a, b) => a.order - b.order)
		: []

	// Проверяем, есть ли данные для отображения в бургере
	const hasBurgerData =
		header?.contacts?.tel ||
		header?.contacts?.email ||
		(header?.socials && header.socials.length > 0)

	return (
		<header
			className={cn(
				styles.header,
				'relative cont items-end flex justify-between py-5',
			)}
		>
			{/* Логотип */}
			<div className='flex-shrink-0'>
				<div className='md:hidden'>
					<Logo logo={header?.logoMob || header?.logo} />
				</div>
				<div className='hidden md:block'>
					<Logo logo={header?.logo} />
				</div>
			</div>

			{/* Навигация */}
			<motion.nav
				className={cn(
					{ [styles.active]: isMenuActive },
					'hidden md:flex h-full transition-all duration-300 ml-4 sm:ml-[86px]',
				)}
				initial={false}
				animate={
					isMenuActive &&
					(header?.contacts?.tel ||
						header?.contacts?.email ||
						(header?.socials && header.socials.length > 0))
						? { flexBasis: '65%' }
						: { flexBasis: '100%' }
				}
				style={{
					overflow: 'hidden',
					minWidth: 0,
					flexShrink: 1,
					flexGrow: 1,
				}}
				transition={{ type: 'spring', stiffness: 190, damping: 24 }}
			>
				<ul
					tabIndex={0}
					className='menu p-0 flex md:flex-row justify-between items-end w-full'
				>
					{isLoading ? (
						// Показываем загрузку или дефолтное меню
						<>
							{[...DEFAULT_HEADER.menu]
								.sort((a, b) => a.order - b.order)
								.map(item => (
									<li
										key={item.id}
										className={cn(styles.item, 'block text-center')}
									>
										<Link
											className='px-[10px] py-0 leading-none text-[22px] transition-opacity ease-out duration-150 hover:bg-transparent hover:opacity-80'
											href={item.url}
										>
											{item.label}
										</Link>
									</li>
								))}
						</>
					) : (
						sortedMenu.map(item => (
							<li
								key={item.id}
								className={cn(styles.item, 'block text-center leading-none')}
							>
								<Link
									className='px-[10px] py-0 leading-none text-[22px] transition-opacity ease-out duration-150 hover:bg-transparent hover:opacity-80'
									href={item.url}
								>
									{item.label}
								</Link>
							</li>
						))
					)}
				</ul>
			</motion.nav>

			{/* motion.div вокруг ContactsAndSocials всегда в flex, даже если данных нет */}
			<motion.div
				initial={false}
				animate={
					isMenuActive &&
					(header?.contacts?.tel ||
						header?.contacts?.email ||
						(header?.socials && header.socials.length > 0))
						? {
								width: 'auto',
								opacity: 1,
								pointerEvents: 'auto',
								marginLeft: 16,
							}
						: { width: 0, opacity: 0, pointerEvents: 'none', marginLeft: 0 }
				}
				transition={{ type: 'spring', stiffness: 190, damping: 24 }}
				style={{
					overflow: 'hidden',
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					minWidth: 0,
				}}
			>
				{(header?.contacts?.tel ||
					header?.contacts?.email ||
					(header?.socials && header.socials.length > 0)) && (
					<ContactsAndSocials
						contacts={header?.contacts}
						socials={header?.socials}
					/>
				)}
			</motion.div>

			{/* Бургер меню - показываем только если есть данные для отображения */}
			{hasBurgerData && <Burger toggleMenu={toggleMenu} />}
		</header>
	)
}

export default Header
