import { fail } from '@sveltejs/kit';
import { checkboxField, numberField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { normalizeCheckoutConfig } from '$lib/shop-checkout';
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
  'email_from',
  'shop_shipping_methods',
  'cash_on_delivery_enabled',
  'cash_on_delivery_surcharge'
];

function pretty(value: unknown) {
  return JSON.stringify(value ?? null, null, 2);
}

export const load: PageServerLoad = async () => {
  const { data, error } = await supabaseAdmin.from('settings').select('key,value').in('key', managedKeys);
  if (error) throw new Error(error.message);
  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  const checkout = normalizeCheckoutConfig(settings);
  const delivery = Object.fromEntries(checkout.deliveryMethods.map((method) => [method.id, method]));
  return {
    settings: {
      admin_email: String(settings.admin_email ?? 'info@petroni.hr'),
      email_from: String(settings.email_from ?? 'Petroni <onboarding@resend.dev>'),
      free_shipping_threshold: Number(settings.free_shipping_threshold ?? 1000),
      min_driver_age: Number(settings.min_driver_age ?? 28),
      km_per_day_included: Number(settings.km_per_day_included ?? 300),
      split_payment_due_days: Number(settings.split_payment_due_days ?? 3),
      overseas_enabled: delivery.overseas.enabled,
      overseas_price: delivery.overseas.price,
      overseas_allows_cod: delivery.overseas.allows_cod,
      boxnow_enabled: delivery.boxnow.enabled,
      boxnow_price: delivery.boxnow.price,
      boxnow_allows_cod: delivery.boxnow.allows_cod,
      personal_pickup_enabled: delivery.personal_pickup.enabled,
      personal_pickup_allows_cod: delivery.personal_pickup.allows_cod,
      cash_on_delivery_enabled: checkout.cashOnDeliveryEnabled,
      cash_on_delivery_surcharge: checkout.cashOnDeliverySurcharge,
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
      split_payment_due_days: numberField(form, 'split_payment_due_days') ?? 3,
      shop_shipping_methods: {
        overseas: { enabled: checkboxField(form, 'overseas_enabled'), price: numberField(form, 'overseas_price') ?? 11, allows_cod: checkboxField(form, 'overseas_allows_cod'), label_hr: 'Overseas dostava', label_en: 'Overseas delivery' },
        boxnow: { enabled: checkboxField(form, 'boxnow_enabled'), price: numberField(form, 'boxnow_price') ?? 9, allows_cod: checkboxField(form, 'boxnow_allows_cod'), label_hr: 'BoxNow paketomat', label_en: 'BoxNow locker' },
        personal_pickup: { enabled: checkboxField(form, 'personal_pickup_enabled'), price: 0, allows_cod: checkboxField(form, 'personal_pickup_allows_cod'), label_hr: 'Osobno preuzimanje', label_en: 'Personal pickup' }
      },
      cash_on_delivery_enabled: checkboxField(form, 'cash_on_delivery_enabled'),
      cash_on_delivery_surcharge: numberField(form, 'cash_on_delivery_surcharge') ?? 1
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
