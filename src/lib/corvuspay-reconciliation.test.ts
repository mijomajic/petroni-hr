import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyCorvuspayReconciliation,
  corvuspayProviderIsPaid,
  corvuspayReconciliationSeverity
} from './corvuspay-reconciliation';

test('recognizes only charged CorvusPay terminal statuses as paid', () => {
  assert.equal(corvuspayProviderIsPaid('authorized'), true);
  assert.equal(corvuspayProviderIsPaid('COMPLETED'), true);
  assert.equal(corvuspayProviderIsPaid('declined'), false);
  assert.equal(corvuspayProviderIsPaid('unprocessed'), false);
});

test('classifies matched and mismatched provider/local payment states', () => {
  assert.equal(classifyCorvuspayReconciliation({ providerStatus: 'authorized', localPaid: true }), 'matched_paid');
  assert.equal(classifyCorvuspayReconciliation({ providerStatus: 'declined', localPaid: false }), 'matched_unpaid');
  assert.equal(classifyCorvuspayReconciliation({ providerStatus: 'completed', localPaid: false }), 'provider_paid_local_unpaid');
  assert.equal(classifyCorvuspayReconciliation({ providerStatus: 'cancelled', localPaid: true }), 'provider_unpaid_local_paid');
  assert.equal(classifyCorvuspayReconciliation({ providerStatus: null, localPaid: false }), 'lookup_failed');
});

test('assigns critical severity only to payment mismatches', () => {
  assert.equal(corvuspayReconciliationSeverity('provider_paid_local_unpaid'), 'critical');
  assert.equal(corvuspayReconciliationSeverity('provider_unpaid_local_paid'), 'critical');
  assert.equal(corvuspayReconciliationSeverity('lookup_failed'), 'warning');
  assert.equal(corvuspayReconciliationSeverity('matched_paid'), null);
});
