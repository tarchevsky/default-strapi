import Link from 'next/link'

export interface BreadcrumbItem {
	label: string
	href?: string
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[]
	className?: string
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
	if (!items?.length) return null

	return (
		<nav aria-label='Хлебные крошки' className={`cont ${className ?? ''}`}>
			<ul className='flex flex-wrap items-center gap-1 text-sm text-base-content/60 pl-0 list-none'>
				{items.map((item, idx) => (
					<li key={idx} className='flex items-center'>
						{item.href && idx !== items.length - 1 ? (
							<Link
								href={item.href}
								className='link link-hover no-underline hover:underline'
							>
								{item.label}
							</Link>
						) : (
							<span>{item.label}</span>
						)}
						{idx < items.length - 1 && <span className='ml-3'>/</span>}
					</li>
				))}
			</ul>
		</nav>
	)
}
