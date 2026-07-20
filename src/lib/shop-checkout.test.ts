import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateShopOrderTotals,
  normalizeCheckoutConfig,
  normalizePostalCodes,
  overseasZoneForPostalCode,
  pickupOnlyRequiresPersonalPickup
} from './shop-checkout';

describe('shop checkout pricing', () => {
  const config = normalizeCheckoutConfig({
    free_shipping_threshold: 100,
    cash_on_delivery_enabled: true,
    cash_on_delivery_surcharge: 1,
    shop_shipping_methods: {
      overseas: { enabled: true, price: 7, allows_cod: true },
      boxnow: { enabled: true, price: 3, allows_cod: true },
      personal_pickup: { enabled: true, price: 20, allows_cod: false }
    },
    shop_overseas_zones: {
      zone_1: {
        label_hr: 'Zona I',
        label_en: 'Zone I',
        tiers: [
          { min: 0, max: 100, price: 11 },
          { min: 100, max: 250, price: 17 },
          { min: 250, max: 500, price: 23 },
          { min: 500, max: 1000, price: 45 }
        ]
      },
      zone_2: {
        label_hr: 'Zona II',
        label_en: 'Zone II',
        postal_codes: ['20225', '21430'],
        tiers: [
          { min: 0, max: 100, price: 20 },
          { min: 100, max: 250, price: 30 },
          { min: 250, max: 500, price: 35 },
          { min: 500, max: 1000, price: 60 }
        ]
      }
    }
  });

  it('adds configured delivery and COD surcharge', () => {
    assert.deepEqual(calculateShopOrderTotals(50, 'boxnow', 'cash_on_delivery', config), {
      subtotal: 50,
      shippingCost: 3,
      paymentSurcharge: 1,
      total: 54
    });
  });

  it('applies free delivery threshold but keeps COD surcharge', () => {
    assert.equal(calculateShopOrderTotals(100, 'overseas', 'cash_on_delivery', config).total, 101);
  });

  it('uses the configured subtotal tier and postal-code zone for Overseas', () => {
    assert.equal(calculateShopOrderTotals(99.99, 'overseas', 'bank_transfer', config, '10000').shippingCost, 11);
    assert.equal(calculateShopOrderTotals(100, 'overseas', 'bank_transfer', config, '10000').shippingCost, 0);

    const tieredConfig = normalizeCheckoutConfig({
      ...config,
      free_shipping_threshold: 1000,
      shop_shipping_methods: {
        overseas: { enabled: true, price: 11, allows_cod: true },
        boxnow: { enabled: true, price: 9, allows_cod: false },
        personal_pickup: { enabled: true, price: 0, allows_cod: false }
      },
      shop_overseas_zones: {
        zone_1: { tiers: config.overseasZones[0].tiers },
        zone_2: { postal_codes: ['20225'], tiers: config.overseasZones[1].tiers }
      }
    });
    assert.equal(calculateShopOrderTotals(249.99, 'overseas', 'bank_transfer', tieredConfig, '10000').shippingCost, 17);
    assert.equal(calculateShopOrderTotals(250, 'overseas', 'bank_transfer', tieredConfig, 'HR-20225').shippingCost, 35);
    assert.equal(overseasZoneForPostalCode('HR-20225', tieredConfig)?.id, 'zone_2');

    const cases: Array<[number, number, number]> = [
      [0, 11, 20],
      [99.99, 11, 20],
      [100, 17, 30],
      [249.99, 17, 30],
      [250, 23, 35],
      [499.99, 23, 35],
      [500, 45, 60],
      [999.99, 45, 60],
      [1000, 0, 0]
    ];
    for (const [subtotal, zoneOnePrice, zoneTwoPrice] of cases) {
      assert.equal(calculateShopOrderTotals(subtotal, 'overseas', 'bank_transfer', tieredConfig, '10000').shippingCost, zoneOnePrice);
      assert.equal(calculateShopOrderTotals(subtotal, 'overseas', 'bank_transfer', tieredConfig, '20225').shippingCost, zoneTwoPrice);
    }
  });

  it('falls back to the legacy flat Overseas price before the zone setting is installed', () => {
    const legacyConfig = normalizeCheckoutConfig({
      free_shipping_threshold: 1000,
      shop_shipping_methods: {
        overseas: { enabled: true, price: 7, allows_cod: true }
      }
    });
    assert.equal(calculateShopOrderTotals(500, 'overseas', 'bank_transfer', legacyConfig, '20225').shippingCost, 7);
  });

  it('keeps BoxNow at its configured price above the Overseas free-shipping threshold', () => {
    assert.equal(calculateShopOrderTotals(100, 'boxnow', 'bank_transfer', config).shippingCost, 3);
  });

  it('normalizes and deduplicates Zone II postal codes', () => {
    assert.deepEqual(normalizePostalCodes('20225\nHR-20225, 21430; invalid'), ['20225', '21430']);
  });

  it('never charges delivery for personal pickup', () => {
    assert.equal(calculateShopOrderTotals(50, 'personal_pickup', 'bank_transfer', config).shippingCost, 0);
  });

  it('requires personal pickup when the basket contains a pickup-only product', () => {
    assert.equal(pickupOnlyRequiresPersonalPickup(true, 'overseas'), true);
    assert.equal(pickupOnlyRequiresPersonalPickup(true, 'boxnow'), true);
    assert.equal(pickupOnlyRequiresPersonalPickup(true, 'personal_pickup'), false);
  });

  it('rejects COD for an incompatible delivery method', () => {
    assert.throws(() => calculateShopOrderTotals(50, 'personal_pickup', 'cash_on_delivery', config));
  });
});
