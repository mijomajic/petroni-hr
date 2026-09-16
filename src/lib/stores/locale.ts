import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { CLIENT_STORAGE_KEYS } from '$lib/config/business';

export type Locale = 'hr' | 'en';

const savedLocale = browser ? localStorage.getItem(CLIENT_STORAGE_KEYS.locale) : null;
const migratedLocale = browser ? new URLSearchParams(window.location.search).get('lang') : null;
const initial: Locale = migratedLocale === 'hr' || savedLocale === 'hr' ? 'hr' : 'en';

export const locale = writable<Locale>(initial);

if (browser) {
  locale.subscribe(value => {
    localStorage.setItem(CLIENT_STORAGE_KEYS.locale, value);
    document.documentElement.lang = value;
  });
}

export function toggleLocale() {
  locale.update(l => l === 'hr' ? 'en' : 'hr');
}
