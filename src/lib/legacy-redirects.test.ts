import assert from 'node:assert/strict';
import test from 'node:test';
import { legacyRedirectTarget } from './legacy-redirects';

test('maps the legacy rental and content URLs to their current equivalents', () => {
  assert.equal(legacyRedirectTarget('/webshop/rezerviraj/'), '/rezerviraj');
  assert.equal(legacyRedirectTarget('/faqs/'), '/faq');
  assert.equal(legacyRedirectTarget('/vehicle/caravans-international-horon-79m/'), '/vozila/najam-kampera/ci-horon-79m');
});

test('maps renamed WooCommerce category URLs to imported shop categories', () => {
  assert.equal(legacyRedirectTarget('/product-category/electrical/solarni-sustavi-2/'), '/shop/elektrika-solarni-sustavi');
  assert.equal(legacyRedirectTarget('/product-category/windows/roof-window/'), '/shop/prozori-krovni-prozori');
});

test('does not redirect a path that is not in the verified legacy mapping', () => {
  assert.equal(legacyRedirectTarget('/unknown-page/'), undefined);
});
