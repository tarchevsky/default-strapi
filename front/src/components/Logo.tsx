'use client'

import { Header } from '@/types/header.types'
import Image from 'next/image'
import Link from 'next/link'
import { FC, useState } from 'react'

interface LogoProps {
	logo?: Header['logo']
}

export const Logo: FC<LogoProps> = ({ logo }) => {
	const [logoError, setLogoError] = useState(false)

	return (
		<Link href='/' className='flex items-center'>
			{logo && !logoError ? (
				<Image
					src={logo.url}
					alt={logo.alt || 'Logo'}
					width={150}
					height={150}
					priority
					className='w-auto rounded-3xl'
					onError={() => setLogoError(true)}
				/>
			) : (
				<div className='flex items-center'>
					<span className='text-2xl'>Logo</span>
				</div>
			)}
		</Link>
	)
}
