import Link from 'next/link'

export interface SeriesRow {
	categorySlug: string
	categoryLabel: string
	series: { seriesSlug: string; name: string }[]
}

interface FeaturedSeriesProps {
	seriesRows: SeriesRow[]
}

const rowLabel = (label: string) =>
	label === 'Статьи' ? 'Серии статей' : label

export function FeaturedSeries({ seriesRows }: FeaturedSeriesProps) {
	return (
		<div className='my-6 md:my-8 space-y-6'>
			{seriesRows.length === 0 ? (
				<div className='cont'>
					<p className='text-sm opacity-60'>Пока нет серий.</p>
				</div>
			) : (
				seriesRows.map(row => (
					<div key={row.categorySlug} className='space-y-2'>
						{row.categoryLabel && (
							<div className='cont'>
								<p className='text-xs uppercase tracking-widest opacity-60 mb-2'>
									{rowLabel(row.categoryLabel)}
								</p>
							</div>
						)}
						<div className='w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-x-auto overflow-y-hidden'>
							<div className='flex gap-6 pb-2 px-[var(--cont-xs)] md:px-[var(--cont-sm)] min-w-max'>
								{row.series.map(s => (
									<Link
										key={`${row.categorySlug}-${s.seriesSlug}`}
										href={`/blog/${row.categorySlug}/series/${s.seriesSlug}`}
										className='flex-shrink-0 text-2xl md:text-4xl font-bold tracking-tight hover:opacity-80 transition-opacity border-b-2 border-transparent hover:border-current'
									>
										{s.name}
									</Link>
								))}
							</div>
						</div>
					</div>
				))
			)}
		</div>
	)
}
