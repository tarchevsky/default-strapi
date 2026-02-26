'use client'

import { getFooter } from '@/services/footer.service'
import { Footer as FooterType } from '@/types/footer.types'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface FooterProps {
	footerData?: FooterType | null
}

const Footer = ({ footerData }: FooterProps) => {
	const [footer, setFooter] = useState<FooterType | null>(footerData ?? null)

	useEffect(() => {
		if (footerData !== undefined) return
		const load = async () => {
			const data = await getFooter()
			setFooter(data)
		}
		load()
	}, [footerData])

	if (!footer) return null

	return (
		<footer className='flex flex-col py-[54.3px] px-4 md:pl-14 md:pr-28 xl:pl-[81.26px] xl:pr-[195px]'>
			<div className='flex flex-col md:grid md:grid-cols-[auto_123px] gap-5 md:gap-56 xl:gap-[432px] items-center'>
				{footer.text && (
					<div dangerouslySetInnerHTML={{ __html: footer.text }} />
				)}
				{footer.logo?.url && (
					<Link href='/' target='_self' rel='noopener noreferrer'>
						<Image
							src={footer.logo.url}
							alt={footer.logo.alt ?? 'Logo'}
							width={123}
							height={118}
							className='rounded-3xl'
						/>
					</Link>
				)}
			</div>
			{footer.companyDetails && (
				<p className='mb-[38.43px] text-center'>
					{footer.companyDetails} © {new Date().getFullYear()}
				</p>
			)}
		</footer>
	)
}

export default Footer
