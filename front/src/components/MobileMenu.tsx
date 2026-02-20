import { Header } from '@/types/header.types'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'

interface MobileMenuProps {
	menu: Header['menu']
}

export const MobileMenu: FC<MobileMenuProps> = ({ menu }) => {
	if (!menu || menu.length === 0) {
		return null
	}

	return (
		<div className='block md:hidden'>
			<div className='dropdown dropdown-end'>
				<label tabIndex={0} className='btn btn-ghost btn-circle'>
					<Menu className='w-7 h-7' />
				</label>
				<ul
					tabIndex={0}
					className='menu menu-sm dropdown-content mt-3 z-[60] p-2 shadow bg-base-100 rounded-box w-52'
				>
					{menu
						.sort((a, b) => a.order - b.order)
						.map(item => (
							<li key={item.id}>
								<Link
									href={item.url}
									className='text-gray-700 hover:text-blue-600 font-medium'
								>
									{item.label}
								</Link>
							</li>
						))}
				</ul>
			</div>
		</div>
	)
}
