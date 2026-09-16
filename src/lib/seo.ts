import { env } from '$env/dynamic/public';
import { BUSINESS } from '$lib/config/business';

export const SITE_URL = normalizeSiteUrl(env.PUBLIC_SITE_URL ?? 'https://demo.alderwaycampers.com');
export const SITE_NAME = BUSINESS.name;
export const DEFAULT_IMAGE = absoluteUrl(BUSINESS.defaultImage);

function normalizeSiteUrl(url: string) {
  return url.replace(/\/+$/, '');
}

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function canonicalPath(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function truncateText(value: string | null | undefined, maxLength = 155) {
  const clean = (value ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}…`;
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function organizationSchema() {
  return {
    '@type': 'LocalBusiness',
    '@id': absoluteUrl('/#organization'),
    name: BUSINESS.name,
    url: SITE_URL,
    logo: absoluteUrl(BUSINESS.logo),
    image: DEFAULT_IMAGE,
    email: BUSINESS.email,
    telephone: BUSINESS.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address,
      addressLocality: BUSINESS.locality,
      postalCode: BUSINESS.postalCode
    }
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': absoluteUrl('/#organization') },
    inLanguage: BUSINESS.defaultLocale
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function graphSchema(items: unknown[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': items
  };
}
