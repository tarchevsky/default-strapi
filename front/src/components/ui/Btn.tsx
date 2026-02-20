import { twMerge } from 'tailwind-merge'

interface BtnProps {
	submit?: boolean
	reject?: boolean
	text: string
	wide?: boolean
	disabled?: boolean
	onClick?: () => void
	className?: string
}

const Btn = ({
	submit,
	reject,
	text,
	wide,
	disabled,
	className,
	onClick,
}: BtnProps) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={twMerge(
				'px-4 py-2 cursor-pointer font-semibold rounded-md transition-colors duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
				submit && 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
				reject &&
					'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:bg-red-200',
				wide && 'w-full',
				disabled && 'opacity-50 cursor-not-allowed',
				className
			)}
		>
			{text}
		</button>
	)
}

export default Btn
