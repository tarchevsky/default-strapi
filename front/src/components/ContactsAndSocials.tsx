import { IconRenderer } from '@/components/IconRenderer'
import { Header } from '@/types/header.types'
import Link from 'next/link'
import { FC } from 'react'

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
		contacts?.tel?.href?.trim() || contacts?.email?.href?.trim()

	if (!hasContacts && validSocials.length === 0) return null

	return (
		<div className='flex flex-shrink-0 justify-between items-center gap-4'>
			{contacts?.tel && contacts.tel.href?.trim() && (
				<Link
					href={contacts.tel.href}
					className='transition-colors px-[10px] py-0 leading-none ease-out duration-150 hover:opacity-80 font-bold'
					aria-label={`Позвонить: ${contacts.tel.value}`}
				>
					{contacts.tel.value}
				</Link>
			)}
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
					<IconRenderer iconName={social.iconName} className='w-6 h-6' />
				</Link>
			))}
		</div>
	)
}
