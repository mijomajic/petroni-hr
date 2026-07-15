import assert from 'node:assert/strict';
import test from 'node:test';
import {
  corvuspayBookingOrderNumber,
  corvuspayCallbackState,
  corvuspayCheckoutFields,
  corvuspayShopOrderNumber,
  corvuspayStatusHash,
  parseCorvuspayOrderNumber,
  signCorvuspayFields,
  verifyCorvuspayCardSuccessResponse,
  verifyCorvuspayCallbackState,
  verifyCorvuspayFields
} from './corvuspay.server';

test('uses Merchant Portal return URLs instead of overriding them per checkout', () => {
  const fields = corvuspayCheckoutFields({
    storeId: '2029',
    secretKey: 'test-key',
    orderNumber: '1234',
    amount: 10,
    description: 'Rezervacija TEST',
    email: 'test@example.com'
  });

  assert.equal('success_url' in fields, false);
  assert.equal('cancel_url' in fields, false);
  assert.equal(verifyCorvuspayFields('test-key', fields), true);
});

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

test('accepts a signed card success response when CorvusPay appends response metadata', () => {
  const response = { approval_code: '88888', language: 'hr', order_number: '1234' };
  const signature = signCorvuspayFields('test-key', response);

  assert.equal(
    verifyCorvuspayCardSuccessResponse('test-key', {
      ...response,
      response_code: '0',
      signature
    }),
    true
  );
  assert.equal(
    verifyCorvuspayCardSuccessResponse('wrong-key', { ...response, signature }),
    false
  );
});

test('signs callback state and status lookups without exposing the secret key', () => {
  const orderNumber = 'B70aa6c81fd314d0485530f603d66e9781';
  const state = corvuspayCallbackState('test-key', orderNumber);
  assert.equal(verifyCorvuspayCallbackState('test-key', orderNumber, state), true);
  assert.equal(verifyCorvuspayCallbackState('test-key', `${orderNumber}x`, state), false);
  assert.equal(
    corvuspayStatusHash({
      secretKey: '86dVcb59moSoDbkESnGiHsDK9',
      orderNumber: 'Corvuš WooCommerce - 007',
      storeId: '413',
      timestamp: '20190701145139'
    }),
    'be4b21290602e27abe778c4736d0666259192985'
  );
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
