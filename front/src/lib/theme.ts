export const THEME = {
	storageKey: 'puhovvv-theme',
	light: 'cupcake',
	dark: 'puhovvv-night',
	timeZone: 'Europe/Moscow',
	// Тёмная тема по умолчанию с 20:00 до 07:00 по Москве
	darkFromHour: 20,
	darkToHour: 7,
} as const

export type SiteThemeId = typeof THEME.light | typeof THEME.dark

/**
 * Логика вынесена в строку, чтобы один и тот же код выполнялся
 * и в inline-скрипте <head> (до отрисовки), и в клиентских компонентах.
 *
 * period() — ключ текущего периода «день/ночь» по Москве, например 2026-11-05n.
 * Ручной выбор пользователя хранится вместе с ключом периода и действует
 * только до следующей смены дня/ночи, после чего тема снова идёт по времени.
 */
const THEME_LOGIC = `
var K=${JSON.stringify(THEME.storageKey)},L=${JSON.stringify(THEME.light)},D=${JSON.stringify(THEME.dark)};
function hourAt(t){return Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:${JSON.stringify(THEME.timeZone)}}).format(t))}
function dateAt(t){return new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:${JSON.stringify(THEME.timeZone)}}).format(t)}
function isNight(){var h=hourAt(new Date());return h>=${THEME.darkFromHour}||h<${THEME.darkToHour}}
function period(){return dateAt(new Date(Date.now()-${THEME.darkToHour}*36e5))+(isNight()?'n':'d')}
function timeTheme(){return isNight()?D:L}
function storedTheme(){try{var v=localStorage.getItem(K);if(!v)return null;var p=v.split('|');if((p[0]===L||p[0]===D)&&p[1]===period())return p[0];localStorage.removeItem(K)}catch(e){}return null}
function activeTheme(){return storedTheme()||timeTheme()}
`

type ThemeApi = {
	activeTheme: () => SiteThemeId
	period: () => string
}

let api: ThemeApi | null = null
function getApi(): ThemeApi {
	if (!api) {
		api = new Function(
			`${THEME_LOGIC}return {activeTheme:activeTheme,period:period}`,
		)() as ThemeApi
	}
	return api
}

/** Ручной выбор (в пределах текущего периода дня/ночи) приоритетнее времени суток */
export function getActiveTheme(): SiteThemeId {
	return getApi().activeTheme()
}

export function applyActiveTheme(): SiteThemeId {
	const theme = getActiveTheme()
	document.documentElement.setAttribute('data-theme', theme)
	return theme
}

export function setStoredTheme(themeId: SiteThemeId): void {
	try {
		localStorage.setItem(THEME.storageKey, `${themeId}|${getApi().period()}`)
	} catch {}
	document.documentElement.setAttribute('data-theme', themeId)
}

/** Выполняется в <head> до отрисовки, чтобы не было вспышки светлой темы */
export const THEME_INIT_SCRIPT = `(function(){try{${THEME_LOGIC}document.documentElement.setAttribute('data-theme',activeTheme())}catch(e){}})();`
