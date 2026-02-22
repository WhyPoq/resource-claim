const STORAGE_KEY = "theme";
export const LIGHT_THEME = "cupcake"; // change to your preferred light theme
export const DARK_THEME = "dracula"; // your dark theme

export function getSystemPrefersDark() {
	return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export function getSavedTheme() {
	return localStorage.getItem(STORAGE_KEY);
}

export function setSavedTheme(theme) {
	localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme) {
	document.documentElement.setAttribute("data-theme", theme);
}

export function initTheme() {
	const saved = getSavedTheme();
	if (saved) {
		applyTheme(saved);
		return saved;
	}
	const theme = getSystemPrefersDark() ? DARK_THEME : LIGHT_THEME;
	applyTheme(theme);
	return theme;
}
