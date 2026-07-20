export function normalizeStockNotificationEmail(value: unknown): string {
  return String(value ?? '').trim().toLocaleLowerCase('en');
}

export function stockNotificationEmailIsValid(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
