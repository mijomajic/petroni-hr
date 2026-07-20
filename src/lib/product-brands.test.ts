import assert from 'node:assert/strict';
import test from 'node:test';
import { orderedFeaturedBrands, uniqueProductBrands } from './product-brands';
import { normalizeStockNotificationEmail, stockNotificationEmailIsValid } from './stock-notifications';

test('featured product brands keep configured order and omit unused brands', () => {
  assert.deepEqual(
    orderedFeaturedBrands(
      ['Carbest', 'Truma', 'Dometic'],
      ['Truma', 'Thule', 'Dometic', 'Truma', 'Carbest']
    ),
    ['Truma', 'Dometic', 'Carbest']
  );
});

test('brand discovery stays case-insensitive and preserves the first public spelling', () => {
  assert.deepEqual(
    uniqueProductBrands([{ brand: 'Truma' }, { brand: ' truma ' }, { brand: null }, { brand: 'THULE' }]),
    ['THULE', 'Truma']
  );
});

test('stock notification email validation normalizes safe addresses', () => {
  assert.equal(normalizeStockNotificationEmail('  Kupac@Example.COM '), 'kupac@example.com');
  assert.equal(stockNotificationEmailIsValid('kupac@example.com'), true);
  assert.equal(stockNotificationEmailIsValid('kupac@example'), false);
  assert.equal(stockNotificationEmailIsValid('kupac @example.com'), false);
});
