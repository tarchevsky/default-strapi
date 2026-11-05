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

function getMoscowHour(): number {
	const hour = new Intl.DateTimeFormat('en-GB', {
		hour: 'numeric',
		hourCycle: 'h23',
		timeZone: THEME.timeZone,
	}).format(new Date())
	return Number(hour)
}

export function getTimeBasedTheme(): SiteThemeId {
	const hour = getMoscowHour()
	return hour >= THEME.darkFromHour || hour < THEME.darkToHour
		? THEME.dark
		: THEME.light
}

function getStoredTheme(): SiteThemeId | null {
	try {
		const stored = localStorage.getItem(THEME.storageKey)
		return stored === THEME.light || stored === THEME.dark ? stored : null
	} catch {
		return null
	}
}

/** Ручной выбор пользователя приоритетнее темы по времени суток */
export function getActiveTheme(): SiteThemeId {
	return getStoredTheme() ?? getTimeBasedTheme()
}

export function setStoredTheme(themeId: SiteThemeId): void {
	try {
		localStorage.setItem(THEME.storageKey, themeId)
	} catch {}
	document.documentElement.setAttribute('data-theme', themeId)
}

/** Выполняется в <head> до отрисовки, чтобы не было вспышки светлой темы */
export const THEME_INIT_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME.storageKey)},l=${JSON.stringify(THEME.light)},d=${JSON.stringify(THEME.dark)};
var t=null;try{t=localStorage.getItem(k)}catch(e){}
if(t!==l&&t!==d){
var h=Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:${JSON.stringify(THEME.timeZone)}}).format(new Date()));
t=(h>=${THEME.darkFromHour}||h<${THEME.darkToHour})?d:l;
}
document.documentElement.setAttribute('data-theme',t);
}catch(e){}})();`
