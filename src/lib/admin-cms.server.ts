import { fail, type ActionFailure } from '@sveltejs/kit';

export type CmsActionResult = ActionFailure<{ message: string }> | { message: string };

export function textField(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

export function optionalTextField(form: FormData, key: string): string | null {
  const value = textField(form, key);
  return value ? value : null;
}

export function numberField(form: FormData, key: string): number | null {
  const raw = textField(form, key).replace(',', '.');
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function integerField(form: FormData, key: string): number | null {
  const value = numberField(form, key);
  return value === null ? null : Math.trunc(value);
}

export function checkboxField(form: FormData, key: string): boolean {
  return form.get(key) === 'on' || form.get(key) === 'true';
}

export function linesField(form: FormData, key: string): string[] {
  return textField(form, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function slugField(form: FormData, key: string, fallback: string): string {
  return slugify(textField(form, key) || fallback);
}

export function jsonObjectField(form: FormData, key: string): Record<string, unknown> | null {
  const raw = textField(form, key);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON mora biti objekt.');
  }
  return parsed as Record<string, unknown>;
}

export function jsonPretty(value: unknown): string {
  if (!value || typeof value !== 'object') return '{}';
  return JSON.stringify(value, null, 2);
}

export function actionError(message: string) {
  return fail(400, { message });
}
