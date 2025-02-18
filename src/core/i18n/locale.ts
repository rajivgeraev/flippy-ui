const LOCALE_STORAGE_KEY = 'app-locale';
const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'ru'] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

export function getLocale(): Locale {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;

    const locale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return locale && SUPPORTED_LOCALES.includes(locale as Locale)
        ? (locale as Locale)
        : DEFAULT_LOCALE;
}

export function setLocale(locale: Locale): void {
    const localeToSet = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, localeToSet);
    }
}