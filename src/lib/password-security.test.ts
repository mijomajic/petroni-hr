import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isEmailAddress,
  isPasswordRecoveryPath,
  passwordContext,
  passwordLoginPath,
  passwordRecoveryPath,
  passwordValidationError
} from './password-security';

test('password context only accepts the explicit admin value', () => {
  assert.equal(passwordContext('admin'), 'admin');
  assert.equal(passwordContext('account'), 'account');
  assert.equal(passwordContext('/admin'), 'account');
});

test('password destinations stay on known internal routes', () => {
  assert.equal(passwordLoginPath('admin', true), '/admin/login?password=promijenjena');
  assert.equal(passwordLoginPath('account', true), '/prijava?password=promijenjena');
  assert.equal(passwordRecoveryPath('admin'), '/postavi-lozinku?context=admin');
  assert.equal(isPasswordRecoveryPath('/postavi-lozinku?context=admin'), true);
  assert.equal(isPasswordRecoveryPath('//example.com/postavi-lozinku'), false);
  assert.equal(isPasswordRecoveryPath('/admin'), false);
});

test('password validation covers current password, length, confirmation and reuse', () => {
  assert.equal(passwordValidationError({ currentPassword: '', password: 'nova-lozinka', passwordConfirm: 'nova-lozinka', requireCurrentPassword: true }), 'current_required');
  assert.equal(passwordValidationError({ password: 'kratka', passwordConfirm: 'kratka' }), 'too_short');
  assert.equal(passwordValidationError({ password: 'nova-lozinka', passwordConfirm: 'druga-lozinka' }), 'mismatch');
  assert.equal(passwordValidationError({ currentPassword: 'ista-lozinka', password: 'ista-lozinka', passwordConfirm: 'ista-lozinka', requireCurrentPassword: true }), 'same_password');
  assert.equal(passwordValidationError({ currentPassword: 'stara-lozinka', password: 'nova-lozinka', passwordConfirm: 'nova-lozinka', requireCurrentPassword: true }), null);
});

test('email validation rejects malformed and oversized values', () => {
  assert.equal(isEmailAddress('moni@example.com'), true);
  assert.equal(isEmailAddress('not-an-email'), false);
  assert.equal(isEmailAddress(`${'a'.repeat(250)}@example.com`), false);
});
