'use client'

import { SearchResultItem } from '@/types/page.types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const DEBOUNCE_MS = 300

interface SearchInputProps {
	placeholder?: string
	className?: string
	inputClassName?: string
	'aria-label'?: string
}

export default function SearchInput({
	placeholder = 'Поиск…',
	className,
	inputClassName,
	'aria-label': ariaLabel = 'Поиск',
}: SearchInputProps) {
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<SearchResultItem[]>([])
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const wrapRef = useRef<HTMLDivElement>(null)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const router = useRouter()

	useEffect(() => {
		const q = query.trim()
		if (!q) {
			setResults([])
			setLoading(false)
			return
		}
		if (timerRef.current) clearTimeout(timerRef.current)
		timerRef.current = setTimeout(async () => {
			setLoading(true)
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
				const data = await res.json()
				setResults(Array.isArray(data) ? data : [])
			} catch {
				setResults([])
			} finally {
				setLoading(false)
			}
			timerRef.current = null
		}, DEBOUNCE_MS)
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [query])

	const onQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
		setOpen(true)
	}, [])

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [])

	const onSelect = useCallback(
		(href: string) => {
			setOpen(false)
			setQuery('')
			setResults([])
			router.push(href)
		},
		[router]
	)

	const showDropdown = open && (query.trim() !== '' || loading)
	const listboxId = 'search-results-listbox'

	return (
		<div ref={wrapRef} className={`relative ${className ?? ''}`}>
			<input
				type="search"
				value={query}
				onChange={onQueryChange}
				onFocus={() => query.trim() && setOpen(true)}
				placeholder={placeholder}
				className={inputClassName}
				aria-label={ariaLabel}
				aria-expanded={showDropdown}
				aria-controls={showDropdown ? listboxId : undefined}
				aria-autocomplete="list"
				role="combobox"
			/>
			{showDropdown && (
				<ul
					id={listboxId}
					className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-lg border border-base-300 bg-base-100 py-1 shadow-lg"
					role="listbox"
				>
					{loading ? (
						<li className="px-3 py-2 text-sm opacity-70">Загрузка…</li>
					) : results.length === 0 ? (
						<li className="px-3 py-2 text-sm opacity-70">
							Ничего не найдено
						</li>
					) : (
						results.map((item) => (
							<li key={`${item.type}-${item.slug}`} role="option" aria-selected={false}>
								<Link
									href={item.href}
									className="block px-3 py-2 text-sm hover:bg-base-200"
									onClick={(e) => {
										e.preventDefault()
										onSelect(item.href)
									}}
								>
									{item.title}
								</Link>
							</li>
						))
					)}
				</ul>
			)}
		</div>
	)
}
