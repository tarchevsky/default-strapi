'use client'

import { searchStore, useSearchState } from '@/components/search/searchStore'
import { forwardRef } from 'react'

interface SearchInputProps {
	placeholder?: string
	className?: string
	inputClassName?: string
	'aria-label'?: string
}

/**
 * Поле-триггер поиска: при вводе текста открывается модалка поиска
 * с этим текстом, дальше ввод продолжается уже в модалке.
 */
const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
	{ placeholder = 'Поиск…', className, inputClassName, 'aria-label': ariaLabel = 'Поиск' },
	ref,
) {
	const { query } = useSearchState()

	return (
		<div className={`relative ${className ?? ''}`}>
			<input
				ref={ref}
				type='search'
				value={query}
				onChange={e => searchStore.open(e.target.value)}
				onKeyDown={e => {
					if (e.key === 'Enter') searchStore.open()
				}}
				placeholder={placeholder}
				className={inputClassName}
				aria-label={ariaLabel}
				aria-haspopup='dialog'
				autoComplete='off'
			/>
		</div>
	)
})

export default SearchInput
