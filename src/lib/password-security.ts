export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_RECOVERY_COOKIE = 'petroni_password_recovery';
export const PASSWORD_RECOVERY_INTENT_COOKIE = 'petroni_password_recovery_intent';

export type PasswordContext = 'account' | 'admin';

export function passwordContext(value: unknown): PasswordContext {
  return value === 'admin' ? 'admin' : 'account';
}

export function passwordLoginPath(context: PasswordContext, changed = false): string {
  const base = context === 'admin' ? '/admin/login' : '/prijava';
  return changed ? `${base}?password=promijenjena` : base;
}

export function passwordRecoveryPath(context: PasswordContext): string {
  return `/postavi-lozinku?context=${context}`;
}

export function isPasswordRecoveryPath(value: string): boolean {
  if (!value.startsWith('/') || value.startsWith('//')) return false;
  try {
    return new URL(value, 'https://petroni.invalid').pathname === '/postavi-lozinku';
  } catch {
    return false;
  }
}

export function isEmailAddress(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function passwordValidationError(input: {
  currentPassword?: string;
  password: string;
  passwordConfirm: string;
  requireCurrentPassword?: boolean;
}): 'current_required' | 'too_short' | 'mismatch' | 'same_password' | null {
  const currentPassword = input.currentPassword ?? '';
  if (input.requireCurrentPassword && !currentPassword) return 'current_required';
  if (input.password.length < PASSWORD_MIN_LENGTH) return 'too_short';
  if (input.password !== input.passwordConfirm) return 'mismatch';
  if (input.requireCurrentPassword && input.password === currentPassword) return 'same_password';
  return null;
}
