import assert from 'node:assert/strict';
import test from 'node:test';
import { publicCategoryLabel } from './category-labels';

test('public category labels replace imported pipe separators', () => {
  assert.equal(publicCategoryLabel('KARAVAN TEHNOLOGIJA | OPREMA', 'hr'), 'KARAVAN TEHNOLOGIJA i OPREMA');
  assert.equal(publicCategoryLabel('Locks | Handles', 'en'), 'Locks & Handles');
  assert.equal(publicCategoryLabel('Elektrika', 'hr'), 'Elektrika');
});
