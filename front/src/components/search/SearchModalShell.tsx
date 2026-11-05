'use client'

import cn from 'clsx'
import { X } from 'lucide-react'
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

const EXIT_MS = 380

interface SearchModalShellProps {
	open: boolean
	onClose: () => void
	children: ReactNode
	'aria-label'?: string
	/** Элемент, получающий фокус сразу после открытия (без задержки — чтобы не терять символы при наборе) */
	initialFocusRef?: RefObject<HTMLInputElement | null>
}

/** Диалог для поиска: портал в body, анимация открытия/закрытия, крестик снаружи (desktop) */
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
			const input = initialFocusRef?.current
			if (input) {
				input.focus()
				const end = input.value.length
				input.setSelectionRange(end, end)
			}
			return
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
				'modal modal-middle modal--search overflow-x-clip p-0 sm:p-4',
				(open || exiting) && 'modal-open',
				exiting && 'modal-exiting',
			)}
			onClose={handleDialogClose}
			onCancel={handleCancel}
			aria-label={ariaLabel}
		>
			<div className='modal-shell relative col-start-1 row-start-1 h-dvh w-full max-h-dvh sm:h-auto sm:w-[min(900px,calc(100%-5rem))] sm:max-h-[calc(100dvh-5rem)]'>
				<button
					type='button'
					className='absolute right-2 top-2 z-20 flex size-9 items-center justify-center rounded-full border border-base-300 bg-base-100 transition-opacity hover:opacity-70 sm:right-0 sm:top-0 sm:size-8 sm:-translate-y-1/2 sm:translate-x-[calc(100%+10px)]'
					onClick={onClose}
					aria-label='Закрыть'
				>
					<X className='size-4' strokeWidth={1.5} />
				</button>
				<div className='modal-box h-full w-full max-w-none max-h-none rounded-none bg-base-100 p-0 sm:h-[600px] sm:max-h-[calc(100dvh-5rem)] sm:rounded-box border border-base-300'>
					<div className='flex h-full flex-col p-6 max-sm:pt-14'>
						{children}
					</div>
				</div>
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
