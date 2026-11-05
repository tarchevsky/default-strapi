'use client'

import { THEME, applyActiveTheme, setStoredTheme } from '@/lib/theme'
import cn from 'clsx'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
	className?: string
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
	const [isDark, setIsDark] = useState(false)

	useEffect(() => {
		const sync = () => setIsDark(applyActiveTheme() === THEME.dark)
		sync()
		// Переключение по времени суток без перезагрузки страницы
		const timer = window.setInterval(sync, 60_000)
		const onVisible = () => {
			if (document.visibilityState === 'visible') sync()
		}
		document.addEventListener('visibilitychange', onVisible)
		return () => {
			window.clearInterval(timer)
			document.removeEventListener('visibilitychange', onVisible)
		}
	}, [])

	const handleChange = (checked: boolean) => {
		setIsDark(checked)
		setStoredTheme(checked ? THEME.dark : THEME.light)
	}

	return (
		<label
			className={cn(
				'swap swap-rotate shrink-0 cursor-pointer transition-opacity duration-150 hover:opacity-80',
				className,
			)}
			aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
			title={isDark ? 'Светлая тема' : 'Тёмная тема'}
		>
			<input
				type='checkbox'
				checked={isDark}
				onChange={e => handleChange(e.target.checked)}
			/>
			<Sun className='swap-off size-6' />
			<Moon className='swap-on size-6' />
		</label>
	)
}
