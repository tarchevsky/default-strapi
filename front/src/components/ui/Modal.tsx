import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import Image from 'next/image'
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
				className={`relative bg-[#002B49] shadow-xl w-full px-3.5 py-[8.66px] ${width}`}
				style={height ? { height } : {}}
			>
				<div className='relative bg-white w-full'>
					{/* Кнопка закрытия: /close.png, 40×40. Как вернуть SVG — см. docs/Modal/close.md */}
					<button
						onClick={onClose}
						className='absolute top-4 right-4 w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity'
						aria-label='Закрыть'
					>
						<Image
							src='/close.png'
							alt=''
							width={40}
							height={40}
						/>
					</button>
					{/* Контент */}
					{children}
				</div>
			</div>
		</div>
	)
}

export default Modal
