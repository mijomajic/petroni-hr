import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Locale = 'hr' | 'en';

const savedLocale = browser ? localStorage.getItem('petroni_locale') : null;
const migratedLocale = browser ? new URLSearchParams(window.location.search).get('lang') : null;
const initial: Locale = migratedLocale === 'en' || savedLocale === 'en' ? 'en' : 'hr';

export const locale = writable<Locale>(initial);

if (browser) {
  locale.subscribe(value => {
    localStorage.setItem('petroni_locale', value);
    document.documentElement.lang = value;
  });
}

export function toggleLocale() {
  locale.update(l => l === 'hr' ? 'en' : 'hr');
}
