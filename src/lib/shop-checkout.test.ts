import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateShopOrderTotals, normalizeCheckoutConfig, pickupOnlyRequiresPersonalPickup } from './shop-checkout';

describe('shop checkout pricing', () => {
  const config = normalizeCheckoutConfig({
    free_shipping_threshold: 100,
    cash_on_delivery_enabled: true,
    cash_on_delivery_surcharge: 1,
    shop_shipping_methods: {
      overseas: { enabled: true, price: 7, allows_cod: true },
      boxnow: { enabled: true, price: 3, allows_cod: true },
      personal_pickup: { enabled: true, price: 20, allows_cod: false }
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
