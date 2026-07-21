import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Locale = 'hr' | 'en';

const initial: Locale = browser
  ? (localStorage.getItem('petroni_locale') as Locale) || 'hr'
  : 'hr';

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
