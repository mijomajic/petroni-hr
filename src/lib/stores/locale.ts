import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { locale as i18nLocale } from 'svelte-i18n';

export type Locale = 'hr' | 'en';

const initial: Locale = browser
  ? (localStorage.getItem('petroni_locale') as Locale) || 'hr'
  : 'hr';

export const locale = writable<Locale>(initial);

if (browser) {
  locale.subscribe(value => {
    localStorage.setItem('petroni_locale', value);
    document.documentElement.lang = value;
    i18nLocale.set(value);
  });
}

export function toggleLocale() {
  locale.update(l => l === 'hr' ? 'en' : 'hr');
}
