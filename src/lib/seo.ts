import { env } from '$env/dynamic/public';

export const SITE_URL = normalizeSiteUrl(env.PUBLIC_SITE_URL ?? 'https://petroni-hr.vercel.app');
export const SITE_NAME = 'Petroni';
export const DEFAULT_IMAGE =
  'https://www.petroni.hr/wp-content/uploads/2025/02/hero-image-petroni-camping-and-caravaning-rental10-1.jpg';

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
    name: 'Petroni',
    url: SITE_URL,
    logo: 'https://www.petroni.hr/wp-content/uploads/2024/03/Logo-Petroni-Yellow-New.png',
    image: DEFAULT_IMAGE,
    email: 'info@petroni.hr',
    telephone: '+385912427247',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Slavka Tomerlina 9',
      addressLocality: 'Sesvete',
      addressRegion: 'Zagreb',
      postalCode: '10380',
      addressCountry: 'HR'
    },
    sameAs: ['https://www.facebook.com/petroni.hr', 'https://www.instagram.com/petroni.hr']
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': absoluteUrl('/#organization') },
    inLanguage: 'hr-HR'
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
