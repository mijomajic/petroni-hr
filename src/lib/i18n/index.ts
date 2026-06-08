import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';
import { browser } from '$app/environment';
import hr from './hr.json';
import en from './en.json';

addMessages('hr', hr);
addMessages('en', en);

const storedLocale = browser ? localStorage.getItem('petroni_locale') || 'hr' : 'hr';

export function setupI18n() {
  return init({
    fallbackLocale: 'hr',
    initialLocale: browser ? storedLocale : 'hr',
  });
}
