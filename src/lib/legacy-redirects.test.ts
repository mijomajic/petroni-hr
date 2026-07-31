import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { LEGACY_PRODUCT_AUDIT } from './legacy-product-decisions.generated';
import { CURRENT_PUBLIC_PATHS, legacyRedirectDecision, legacyRedirectTarget } from './legacy-redirects';

type SitemapSnapshot = {
  summary: { url_count: number; unique_url_count: number };
  sitemaps: Array<{ name: string; urls: string[] }>;
};

const snapshot = JSON.parse(readFileSync(
  new URL('../../docs/go-live/legacy-wordpress-sitemaps-2026-07-31.json', import.meta.url),
  'utf8'
)) as SitemapSnapshot;

test('maps Croatian, English and query-based legacy pages in one hop', () => {
  assert.equal(legacyRedirectTarget('/webshop/rezerviraj/'), '/rezerviraj');
  assert.equal(legacyRedirectTarget('/faqs/'), '/faq');
  assert.deepEqual(legacyRedirectDecision('/en/about/'), {
    status: 308,
    target: '/o-nama',
    locale: 'en',
    preserveSearch: true
  });
  assert.deepEqual(legacyRedirectDecision('/', new URLSearchParams('taxonomy=product_shipping_class&term=heavy-pacages')), {
    status: 308,
    target: '/shop',
    preserveSearch: false
  });
});

test('maps renamed products through audited WooCommerce SKU links', () => {
  assert.ok(LEGACY_PRODUCT_AUDIT.aliased_product_targets > 500);
  assert.equal(
    legacyRedirectTarget('/en/product/pumpa-za-vodu-shurflo-lilie-12v-14-bar-7-lit-min-2/'),
    '/product/pumpa-za-vodu-shurflo-lilie-12v-1-4-bar-7-lit-min'
  );
  assert.equal(
    legacyRedirectTarget('/proizvod/tekucina-za-ciscenje-i-dezinfekciju-spremnika-vode-eco-air-steril-tank-05l/'),
    '/product/tekucina-za-ciscenje-i-dezinfekciju-spremnika-vode-eco-air-steril-tank-0-5l'
  );
});

test('maps every legacy product category to a live shop category or shop root', () => {
  const categorySitemap = snapshot.sitemaps.find((sitemap) => sitemap.name === 'product_cat-sitemap.xml');
  assert.ok(categorySitemap);
  for (const value of categorySitemap.urls) {
    const url = new URL(value.replaceAll('&amp;', '&'));
    const decision = legacyRedirectDecision(url.pathname, url.searchParams);
    assert.equal(decision?.status, 308, `Missing category decision for ${url.pathname}`);
    if (decision?.status === 308) assert.match(decision.target, /^\/shop(?:\/|$)/);
  }
});

test('maps known vehicles and returns Gone for retired records without a replacement', () => {
  assert.equal(legacyRedirectTarget('/vehicle/caravans-international-horon-79m/'), '/vozila/ci-horon-79m');
  assert.equal(legacyRedirectTarget('/en/vehicle/truck-eurocargo-75e15-taillift-grip-electric/'), '/vozila/kamion-eurocargo-75e15');
  assert.deepEqual(legacyRedirectDecision('/en/vehicle/xgo-dynamic-35/'), {
    status: 410,
    reason: 'removed_vehicle'
  });
  assert.equal(legacyRedirectTarget('/vozila/najam-kampera/ci-horon-79m'), '/vozila/ci-horon-79m');
});

test('every frozen legacy sitemap URL has a canonical, redirect or explicit Gone decision', () => {
  assert.equal(snapshot.summary.url_count, 3638);
  assert.equal(snapshot.summary.unique_url_count, 3636);

  const missing: string[] = [];
  const chains: string[] = [];
  for (const rawValue of new Set(snapshot.sitemaps.flatMap((sitemap) => sitemap.urls))) {
    const url = new URL(rawValue.replaceAll('&amp;', '&'));
    const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
    if (CURRENT_PUBLIC_PATHS.has(path)) continue;

    const decision = legacyRedirectDecision(path, url.searchParams);
    if (!decision) {
      missing.push(`${path}${url.search}`);
      continue;
    }
    if (decision.status === 308) {
      const targetPath = new URL(decision.target, 'https://www.petroni.hr').pathname;
      const nextDecision = legacyRedirectDecision(targetPath);
      if (nextDecision?.status === 308 && nextDecision.target !== targetPath) {
        chains.push(`${path} -> ${decision.target} -> ${nextDecision.target}`);
      }
    }
  }

  assert.deepEqual(missing, []);
  assert.deepEqual(chains, []);
});

test('does not redirect an unrelated current path', () => {
  assert.equal(legacyRedirectDecision('/unknown-page/'), undefined);
});
