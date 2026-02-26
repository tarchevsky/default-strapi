import cn from 'clsx'
import styles from './Burger.module.scss'

interface BurgerProps {
	isActive: boolean
	toggleMenu: () => void
	className?: string
}

const Burger = ({ isActive, toggleMenu, className }: BurgerProps) => {
	return (
		<button
			type='button'
			className={cn(styles.burger, className)}
			aria-label={isActive ? 'Закрыть меню' : 'Открыть меню'}
			aria-expanded={isActive}
			onClick={toggleMenu}
		>
			<span className={cn(styles.inner, isActive && styles.active)}>
				<span />
				<span />
				<span />
			</span>
		</button>
	)
}

export default Burger
