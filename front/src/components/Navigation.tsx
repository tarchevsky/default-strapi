import { Header } from '@/types/header.types'
import Link from 'next/link'
import { FC } from 'react'

interface NavigationProps {
	menu: Header['menu']
	className?: string
}

export const Navigation: FC<NavigationProps> = ({ menu, className = '' }) => {
	if (!menu || menu.length === 0) {
		return null
	}

	return (
		<nav className={className}>
			{menu
				.sort((a, b) => a.order - b.order)
				.map(item => (
					<Link
						key={item.id}
						href={item.url}
						className='text-white btn btn-ghost transition-colors font-medium'
					>
						{item.label}
					</Link>
				))}
		</nav>
	)
}
