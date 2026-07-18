export function publicCategoryLabel(value: string, locale: 'hr' | 'en') {
  return value.replace(/\s*\|\s*/g, locale === 'hr' ? ' i ' : ' & ');
}
