'use client'

import { IconRenderer } from '@/components/IconRenderer'
import { Header } from '@/types/header.types'
import cn from 'clsx'
import Link from 'next/link'
import { FC, useEffect, useRef, useState } from 'react'
import { TiPhone } from 'react-icons/ti'

interface ContactsAndSocialsProps {
	contacts?: Header['contacts']
	socials?: Header['socials']
}

export const ContactsAndSocials: FC<ContactsAndSocialsProps> = ({
	contacts,
	socials,
}) => {
	const validSocials = socials?.filter(s => s.link?.trim()) ?? []
	const hasContacts =
		contacts?.tel?.href?.trim() ||
		contacts?.tel2?.href?.trim() ||
		contacts?.email?.href?.trim()

	const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false)
	const phoneDropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!phoneDropdownOpen) return
		const handleClick = (e: MouseEvent) => {
			const el = phoneDropdownRef.current
			if (el && !el.contains(e.target as Node)) {
				setPhoneDropdownOpen(false)
			}
		}
		document.addEventListener('click', handleClick)
		return () => document.removeEventListener('click', handleClick)
	}, [phoneDropdownOpen])

	if (!hasContacts && validSocials.length === 0) return null

	const tel = contacts?.tel
	const tel2 = contacts?.tel2
	const hasDualPhone = Boolean(tel?.href?.trim() && tel2?.href?.trim())

	return (
		<div className='flex flex-shrink-0 justify-between items-center gap-4'>
			{tel?.href?.trim() &&
				(hasDualPhone && tel2 ? (
					<>
						<div className='flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden'>
							<Link
								href={tel.href}
								className='transition-colors px-[10px] py-0 leading-none ease-out duration-150 hover:opacity-80 font-bold'
								aria-label={`Позвонить: ${tel.value}`}
							>
								{tel.value}
							</Link>
							<Link
								href={tel2.href}
								className='transition-colors px-[10px] py-0 leading-none ease-out duration-150 hover:opacity-80 font-bold'
								aria-label={`Позвонить: ${tel2.value}`}
							>
								{tel2.value}
							</Link>
						</div>
						<div
							ref={phoneDropdownRef}
							className={cn(
								'dropdown dropdown-end hidden md:flex',
								phoneDropdownOpen && 'dropdown-open',
							)}
						>
							<button
								type='button'
								className='transition-colors inline-flex items-center justify-center px-[10px] py-0 leading-none ease-out duration-150 hover:opacity-80 font-bold'
								aria-expanded={phoneDropdownOpen}
								aria-haspopup='menu'
								aria-label='Выбрать телефон'
								onClick={e => {
									e.stopPropagation()
									setPhoneDropdownOpen(v => !v)
								}}
							>
								<TiPhone className='block w-6 h-6' />
							</button>
							<ul className='menu menu-sm dropdown-content mt-10 z-[60] p-2 shadow bg-base-100 rounded-box w-52'>
								<li>
									<Link
										href={tel.href}
										onClick={() => setPhoneDropdownOpen(false)}
									>
										{tel.value}
									</Link>
								</li>
								<li>
									<Link
										href={tel2.href}
										onClick={() => setPhoneDropdownOpen(false)}
									>
										{tel2.value}
									</Link>
								</li>
							</ul>
						</div>
					</>
				) : (
					<Link
						href={tel.href}
						className='transition-colors inline-flex items-center justify-center px-[10px] py-0 leading-none ease-out duration-150 hover:opacity-80 font-bold'
						aria-label={`Позвонить: ${tel.value}`}
					>
						<TiPhone className='block w-6 h-6' />
					</Link>
				))}
			{contacts?.email && contacts.email.href?.trim() && (
				<Link
					href={contacts.email.href}
					className='transition-colors px-[10px] py-0 leading-none ease-out duration-150 hover:opacity-80 font-bold'
					aria-label={`Написать на: ${contacts.email.value}`}
				>
					{contacts.email.value}
				</Link>
			)}
			{validSocials.map(social => (
				<Link
					key={social.id}
					href={social.link}
					target='_blank'
					rel='noopener noreferrer'
					className='transition-colors'
					title={`Перейти по ссылке: ${social.link}`}
				>
					<IconRenderer
						iconName={social.iconName}
						className={
							social.width === 16
								? 'w-4 h-4'
								: social.width === 20
									? 'w-5 h-5'
									: social.width === 28
										? 'w-7 h-7'
										: social.width === 32
											? 'w-8 h-8'
											: 'w-6 h-6'
						}
					/>
				</Link>
			))}
		</div>
	)
}
