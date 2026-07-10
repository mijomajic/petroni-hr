import assert from 'node:assert/strict';
import test from 'node:test';
import {
  corvuspayBookingOrderNumber,
  corvuspayShopOrderNumber,
  parseCorvuspayOrderNumber,
  signCorvuspayFields,
  verifyCorvuspayFields
} from './corvuspay.server';

test('signs CorvusPay fields exactly as specified in the integration manual', () => {
  const signature = signCorvuspayFields('UNV3-i2otJw0rUWzA2lpcNRqTOYRWdAeTw', {
    version: '1.6',
    store_id: '2029',
    order_number: '1537270065109',
    amount: '10.00',
    currency: 'EUR',
    // The manual's published checksum uses this exact cart value.
    cart: 'order256',
    require_complete: 'false',
    language: 'hr',
    cardholder_country_code: 'HR'
  });

  assert.equal(signature, 'cd22a5132907a9f551777bb6c1de78129039e364c822ce94d3df362f269ab139');
});

test('preserves spaces in values while signing CorvusPay fields', () => {
  const base = { amount: '10.00', cart: 'order256' };
  assert.notEqual(
    signCorvuspayFields('test-key', base),
    signCorvuspayFields('test-key', { ...base, cart: 'order 256' })
  );
});

test('verifies CorvusPay signatures case-insensitively', () => {
  const fields = { order_number: '1234', language: 'hr' };
  const signature = signCorvuspayFields('test-key', fields).toUpperCase();
  assert.equal(verifyCorvuspayFields('test-key', { ...fields, signature }), true);
});

test('creates short reversible CorvusPay order references', () => {
  const id = '70aa6c81-fd31-4d04-8553-0f603d66e978';
  const bookingReference = corvuspayBookingOrderNumber(id, 2);
  assert.equal(bookingReference.length, 34);
  assert.deepEqual(parseCorvuspayOrderNumber(bookingReference), { kind: 'booking', bookingId: id, paymentPart: 2 });

  const orderReference = corvuspayShopOrderNumber(id);
  assert.equal(orderReference.length, 33);
  assert.deepEqual(parseCorvuspayOrderNumber(orderReference), { kind: 'order', orderId: id });
});
