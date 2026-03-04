import Link from 'next/link'

export interface BarLinkItem {
	href: string
	name: string
	description?: string
}

interface BarLinkListProps {
	items: BarLinkItem[]
	className?: string
	emptyMessage?: string
}

export default function BarLinkList({
	items,
	className = 'list-none space-y-2 pl-0',
	emptyMessage,
}: BarLinkListProps) {
	if (items.length === 0 && emptyMessage) {
		return <p className='text-sm opacity-80'>{emptyMessage}</p>
	}
	if (items.length === 0) return null

	return (
		<ul className={className}>
			{items.map(item => (
				<li key={item.href} className='group'>
					<Link
						href={item.href}
						className='link font-serif relative inline-block pl-0 pr-1 py-0.5 transition-colors duration-200 ease-in text-base-content/80 hover:text-base-content'
					>
						<span
							className='absolute left-0 top-0 h-full w-0 bg-base-content/85 transition-[width] duration-200 ease-in group-hover:w-3'
							aria-hidden
						/>
						<span className='relative block pr-1 transition-[padding-left] duration-200 ease-in group-hover:pl-6'>
							{item.name}
							{item.description ? ` (${item.description})` : ''}
						</span>
					</Link>
				</li>
			))}
		</ul>
	)
}
