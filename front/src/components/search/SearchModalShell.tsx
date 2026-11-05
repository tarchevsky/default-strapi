'use client'

import cn from 'clsx'
import {
	useEffect,
	useRef,
	useState,
	type ReactNode,
	type RefObject,
	type SyntheticEvent,
} from 'react'
import { createPortal } from 'react-dom'
import './search-modal.css'

const EXIT_MS = 320

interface SearchModalShellProps {
	open: boolean
	onClose: () => void
	children: ReactNode
	'aria-label'?: string
	/** Элемент, получающий фокус сразу после открытия (без задержки — чтобы не терять символы при наборе) */
	initialFocusRef?: RefObject<HTMLInputElement | null>
}

/** Диалог поиска: портал в body, карточка по центру с отступами от краёв, анимация открытия/закрытия */
export default function SearchModalShell({
	open,
	onClose,
	children,
	'aria-label': ariaLabel,
	initialFocusRef,
}: SearchModalShellProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const openRef = useRef(open)
	const [mounted, setMounted] = useState(false)
	const [exiting, setExiting] = useState(false)

	openRef.current = open

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog || !mounted) return

		if (open) {
			setExiting(false)
			if (!dialog.open) dialog.showModal()
			const focusInput = () => {
				const input = initialFocusRef?.current
				if (!input || document.activeElement === input) return
				input.focus()
				const end = input.value.length
				input.setSelectionRange(end, end)
			}
			// Сразу — чтобы не терять символы при наборе; повторно — если фокус перехватили (клик/тач по кнопке)
			focusInput()
			const frame = requestAnimationFrame(() => requestAnimationFrame(focusInput))
			return () => cancelAnimationFrame(frame)
		}

		if (!dialog.open) return

		setExiting(true)
		const timeout = window.setTimeout(() => {
			dialog.close()
			setExiting(false)
		}, EXIT_MS)

		return () => window.clearTimeout(timeout)
	}, [open, mounted, initialFocusRef])

	useEffect(() => {
		if (!open && !exiting) return
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = ''
		}
	}, [open, exiting])

	const handleDialogClose = () => {
		if (openRef.current) onClose()
	}

	const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
		event.preventDefault()
		onClose()
	}

	if (!mounted) return null

	return createPortal(
		<dialog
			ref={dialogRef}
			className={cn(
				'modal modal--search px-4 py-4 max-sm:items-start max-sm:pt-16 sm:px-6 sm:py-10',
				(open || exiting) && 'modal-open',
				exiting && 'modal-exiting',
			)}
			onClose={handleDialogClose}
			onCancel={handleCancel}
			aria-label={ariaLabel}
		>
			<div className='modal-shell relative z-10 col-start-1 row-start-1 flex max-h-[min(640px,calc(100dvh-5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 text-base-content shadow-2xl sm:max-h-[min(680px,calc(100dvh-5rem))]'>
				{children}
			</div>

			<form method='dialog' className='modal-backdrop'>
				<button type='button' onClick={onClose} aria-label='Закрыть'>
					закрыть
				</button>
			</form>
		</dialog>,
		document.body,
	)
}
