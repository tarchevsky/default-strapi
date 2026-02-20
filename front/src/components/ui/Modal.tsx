import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { ReactNode } from 'react'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	children: ReactNode
	width?: string
	height?: string
}

const Modal = ({
	isOpen,
	onClose,
	children,
	width = 'max-w-md',
	height,
}: ModalProps) => {
	useBodyScrollLock(isOpen)

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			{/* Затемненный фон */}
			<div className='absolute inset-0 bg-black/35' onClick={onClose} />

			{/* Модальное окно */}
			<div
				className={`relative bg-white rounded-lg shadow-xl w-full p-6 ${width}`}
				style={height ? { height } : {}}
			>
				{/* Кнопка закрытия */}
				<button
					onClick={onClose}
					className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
				>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M6 18L18 6M6 6l12 12'
						/>
					</svg>
				</button>

				{/* Контент */}
				{children}
			</div>
		</div>
	)
}

export default Modal
