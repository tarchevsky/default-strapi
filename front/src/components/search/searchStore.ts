'use client'

import { useSyncExternalStore } from 'react'

/** Общее состояние модалки поиска: поле в шапке/блоге и модалка работают с одним запросом */
interface SearchState {
	open: boolean
	query: string
}

let state: SearchState = { open: false, query: '' }
const listeners = new Set<() => void>()

const setState = (next: Partial<SearchState>) => {
	state = { ...state, ...next }
	listeners.forEach(l => l())
}

export const searchStore = {
	subscribe(listener: () => void) {
		listeners.add(listener)
		return () => listeners.delete(listener)
	},
	get: () => state,
	/** Открыть модалку; при вводе в поле — сразу с набранным текстом */
	open: (query?: string) => setState({ open: true, query: query ?? state.query }),
	close: () => setState({ open: false, query: '' }),
	setQuery: (query: string) => setState({ query }),
}

const SERVER_STATE: SearchState = { open: false, query: '' }

export const useSearchState = () =>
	useSyncExternalStore(searchStore.subscribe, searchStore.get, () => SERVER_STATE)
