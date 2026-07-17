import { absoluteUrl } from '$lib/seo';
import { supabaseAdmin } from '$lib/supabase.server';
import type { RequestHandler } from './$types';

type SitemapEntry = {
  path: string;
  lastmod?: string | null;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: string;
};

const staticEntries: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/rezerviraj', changefreq: 'weekly', priority: '0.9' },
  { path: '/vozila', changefreq: 'weekly', priority: '0.9' },
  { path: '/vozila/najam-kampera', changefreq: 'weekly', priority: '0.9' },
  { path: '/vozila/vozila-za-prodaju', changefreq: 'weekly', priority: '0.8' },
  { path: '/vozila/vozila-za-filmske-produkcije', changefreq: 'monthly', priority: '0.7' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/novosti', changefreq: 'weekly', priority: '0.7' },
  { path: '/o-nama', changefreq: 'monthly', priority: '0.6' },
  { path: '/kontakt', changefreq: 'monthly', priority: '0.7' },
  { path: '/faq', changefreq: 'monthly', priority: '0.5' },
  { path: '/uvjeti-najma', changefreq: 'monthly', priority: '0.5' },
  { path: '/placanje-dostava', changefreq: 'monthly', priority: '0.5' },
  { path: '/reklamacije-povrat', changefreq: 'monthly', priority: '0.4' },
  { path: '/privatnost', changefreq: 'yearly', priority: '0.3' }
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

function urlEntry(entry: SitemapEntry) {
  const loc = escapeXml(absoluteUrl(entry.path));
  const lastmod = formatDate(entry.lastmod);
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : '',
    entry.priority ? `    <priority>${entry.priority}</priority>` : '',
    '  </url>'
  ].filter(Boolean).join('\n');
}

export const GET: RequestHandler = async () => {
  const [vehicles, products, categories, posts] = await Promise.all([
    supabaseAdmin
      .from('vehicles')
      .select('slug,created_at')
      .eq('is_available', true)
      .order('sort_order'),
    supabaseAdmin
      .from('products')
      .select('slug,created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(0, 4999),
    supabaseAdmin.from('product_categories').select('slug').order('sort_order'),
    supabaseAdmin
      .from('posts')
      .select('slug,published_at,created_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
  ]);

  const entries: SitemapEntry[] = [
    ...staticEntries,
    ...(vehicles.data ?? []).map((vehicle) => ({
      path: `/vozila/${vehicle.slug}`,
      lastmod: vehicle.created_at,
      changefreq: 'weekly' as const,
      priority: '0.8'
    })),
    ...(categories.data ?? []).map((category) => ({
      path: `/shop/${category.slug}`,
      changefreq: 'weekly' as const,
      priority: '0.7'
    })),
    ...(products.data ?? []).map((product) => ({
      path: `/product/${product.slug}`,
      lastmod: product.created_at,
      changefreq: 'weekly' as const,
      priority: '0.6'
    })),
    ...(posts.data ?? []).map((post) => ({
      path: `/novosti/${post.slug}`,
      lastmod: post.published_at ?? post.created_at,
      changefreq: 'monthly' as const,
      priority: '0.5'
    }))
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(urlEntry),
    '</urlset>'
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600'
    }
  });
};
