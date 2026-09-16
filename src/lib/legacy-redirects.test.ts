import assert from 'node:assert/strict';
import test from 'node:test';
import { LEGACY_PRODUCT_AUDIT } from './legacy-product-decisions.generated';
import { legacyRedirectDecision, legacyRedirectTarget } from './legacy-redirects';

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

test('maps representative legacy product categories to the shop', () => {
  for (const path of ['/product-category/electrical/', '/product-category/water-sanitary/', '/en/product-category/security/']) {
    const decision = legacyRedirectDecision(path);
    assert.equal(decision?.status, 308, `Missing category decision for ${path}`);
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

test('does not redirect an unrelated current path', () => {
  assert.equal(legacyRedirectDecision('/unknown-page/'), undefined);
});
