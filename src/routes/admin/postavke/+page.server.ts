import { fail } from '@sveltejs/kit';
import { numberField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

const managedKeys = [
  'admin_email',
  'company',
  'ibans',
  'free_shipping_threshold',
  'min_driver_age',
  'km_per_day_included',
  'split_payment_due_days',
  'email_from'
];

function pretty(value: unknown) {
  return JSON.stringify(value ?? null, null, 2);
}

export const load: PageServerLoad = async () => {
  const { data, error } = await supabaseAdmin.from('settings').select('key,value').in('key', managedKeys);
  if (error) throw new Error(error.message);
  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  return {
    settings: {
      admin_email: String(settings.admin_email ?? 'info@petroni.hr'),
      email_from: String(settings.email_from ?? 'Petroni <onboarding@resend.dev>'),
      free_shipping_threshold: Number(settings.free_shipping_threshold ?? 1000),
      min_driver_age: Number(settings.min_driver_age ?? 28),
      km_per_day_included: Number(settings.km_per_day_included ?? 300),
      split_payment_due_days: Number(settings.split_payment_due_days ?? 3),
      company_json: pretty(settings.company ?? {}),
      ibans_json: pretty(settings.ibans ?? [])
    }
  };
};

async function upsertSetting(key: string, value: unknown) {
  return supabaseAdmin.from('settings').upsert({ key, value });
}

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    let company: unknown;
    let ibans: unknown;
    try {
      company = JSON.parse(textField(form, 'company_json') || '{}') as unknown;
      ibans = JSON.parse(textField(form, 'ibans_json') || '[]') as unknown;
    } catch {
      return fail(400, { message: 'Company ili IBAN JSON nije ispravan.' });
    }
    if (!Array.isArray(ibans)) return fail(400, { message: 'IBAN konfiguracija mora biti JSON lista.' });

    const updates: Record<string, unknown> = {
      admin_email: textField(form, 'admin_email') || 'info@petroni.hr',
      email_from: textField(form, 'email_from') || 'Petroni <onboarding@resend.dev>',
      company,
      ibans,
      free_shipping_threshold: numberField(form, 'free_shipping_threshold') ?? 1000,
      min_driver_age: numberField(form, 'min_driver_age') ?? 28,
      km_per_day_included: numberField(form, 'km_per_day_included') ?? 300,
      split_payment_due_days: numberField(form, 'split_payment_due_days') ?? 3
    };

    const { data: before } = await supabaseAdmin.from('settings').select('key,value').in('key', managedKeys);
    for (const [key, value] of Object.entries(updates)) {
      const { error } = await upsertSetting(key, value);
      if (error) return fail(400, { message: error.message });
    }

    await recordAdminEvent({
      administrator,
      entityType: 'settings',
      entityId: 'global',
      action: 'settings_updated',
      beforeState: before,
      afterState: Object.keys(updates)
    });
    return { message: 'Postavke su spremljene.' };
  }
};
