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
	// Если нет ни контактов, ни соцсетей, не рендерим компонент
	if (
		!contacts?.tel &&
		!contacts?.email &&
		(!socials || socials.length === 0)
	) {
		return null
	}

	return (
		<div className='flex flex-shrink-0 justify-between items-center gap-4'>
			{contacts?.tel && (
				<Link
					href={contacts.tel.href}
					className='text-[#893829] transition-colors px-[10px] py-0 leading-none text-[22px] ease-out duration-150 hover:opacity-80 font-bold'
					aria-label={`Позвонить: ${contacts.tel.value}`}
				>
					{contacts.tel.value}
				</Link>
			)}
			{contacts?.email && (
				<Link
					href={contacts.email.href}
					className='text-[#893829] transition-colors px-[10px] py-0 leading-none text-[22px] ease-out duration-150 hover:opacity-80 font-bold'
					aria-label={`Написать на: ${contacts.email.value}`}
				>
					{contacts.email.value}
				</Link>
			)}
			{socials &&
				socials.length > 0 &&
				socials.map(social => (
					<Link
						key={social.id}
						href={social.link}
						target='_blank'
						rel='noopener noreferrer'
						className='text-[#893829] transition-colors'
						title={`Перейти по ссылке: ${social.link}`}
					>
						<IconRenderer iconName={social.iconName} className='w-6 h-6' />
					</Link>
				))}
		</div>
	)
}
