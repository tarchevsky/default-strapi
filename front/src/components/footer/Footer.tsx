'use client'

import Link from 'next/link'

const Footer = () => {
	return (
		<footer className='cont' style={{ fontFamily: 'Helvetica' }}>
			<Link
				className='mb-[40px]'
				href='#'
				target='_blank'
				rel='noopener noreferrer'
			>
				Название блога
			</Link>
		</footer>
	)
}

export default Footer
