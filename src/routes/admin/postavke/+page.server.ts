import { fail } from '@sveltejs/kit';
import { checkboxField, numberField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { normalizeCheckoutConfig, normalizePostalCodes, OVERSEAS_TIER_RANGES, type OverseasShippingZone } from '$lib/shop-checkout';
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
  'split_payment_min_advance_days',
  'booking_time_selection_start',
  'booking_time_selection_end',
  'email_from',
  'shop_featured_brands',
  'shop_shipping_methods',
  'shop_overseas_zones',
  'cash_on_delivery_enabled',
  'cash_on_delivery_surcharge'
];

function pretty(value: unknown) {
  return JSON.stringify(value ?? null, null, 2);
}

function zone(checkout: ReturnType<typeof normalizeCheckoutConfig>, id: OverseasShippingZone['id']) {
  return (checkout.overseasZones.find((item) => item.id === id) ?? checkout.overseasZones[0]) as OverseasShippingZone;
}

function priceForTier(shippingZone: OverseasShippingZone, index: number, fallback: number) {
  return shippingZone.tiers[index]?.price ?? fallback;
}

function tierLabel(index: number) {
  const range = OVERSEAS_TIER_RANGES[index];
  if (!range) return '';
  return `${range.min.toFixed(2)}–${(range.max - 0.01).toFixed(2)} EUR`;
}

export const load: PageServerLoad = async () => {
  const { data, error } = await supabaseAdmin.from('settings').select('key,value').in('key', managedKeys);
  if (error) throw new Error(error.message);
  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  const checkout = normalizeCheckoutConfig(settings);
  const delivery = Object.fromEntries(checkout.deliveryMethods.map((method) => [method.id, method]));
  const zoneOne = zone(checkout, 'zone_1');
  const zoneTwo = zone(checkout, 'zone_2');
  return {
    settings: {
      admin_email: String(settings.admin_email ?? 'info@petroni.hr'),
      email_from: String(settings.email_from ?? 'Petroni <onboarding@resend.dev>'),
      free_shipping_threshold: Number(settings.free_shipping_threshold ?? 1000),
      min_driver_age: Number(settings.min_driver_age ?? 28),
      km_per_day_included: Number(settings.km_per_day_included ?? 300),
      split_payment_due_days: Number(settings.split_payment_due_days ?? 45),
      split_payment_min_advance_days: Number(settings.split_payment_min_advance_days ?? 45),
      booking_time_selection_start: String(settings.booking_time_selection_start ?? '09:00'),
      booking_time_selection_end: String(settings.booking_time_selection_end ?? '18:00'),
      shop_featured_brands: Array.isArray(settings.shop_featured_brands)
        ? settings.shop_featured_brands.map(String).join('\n')
        : '',
      overseas_enabled: delivery.overseas.enabled,
      overseas_allows_cod: delivery.overseas.allows_cod,
      overseas_tiers: OVERSEAS_TIER_RANGES.map((_, index) => ({
        label: tierLabel(index),
        zone_1_price: priceForTier(zoneOne, index, delivery.overseas.price),
        zone_2_price: priceForTier(zoneTwo, index, delivery.overseas.price)
      })),
      overseas_zone_2_postal_codes: zoneTwo.postalCodes.join('\n'),
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
    const bookingTimeStart = textField(form, 'booking_time_selection_start') || '09:00';
    const bookingTimeEnd = textField(form, 'booking_time_selection_end') || '18:00';
    if (!/^\d{2}:\d{2}$/.test(bookingTimeStart) || !/^\d{2}:\d{2}$/.test(bookingTimeEnd) || bookingTimeStart >= bookingTimeEnd) {
      return fail(400, { message: 'Raspon termina mora biti valjan, primjerice 09:00–18:00.' });
    }

    const { data: before, error: settingsError } = await supabaseAdmin.from('settings').select('key,value').in('key', managedKeys);
    if (settingsError) return fail(400, { message: settingsError.message });
    const currentSettings = Object.fromEntries((before ?? []).map((row) => [row.key, row.value]));
    const currentCheckout = normalizeCheckoutConfig(currentSettings);
    const currentZoneOne = zone(currentCheckout, 'zone_1');
    const currentZoneTwo = zone(currentCheckout, 'zone_2');
    const overseasTiers = OVERSEAS_TIER_RANGES.map((range, index) => ({
      range,
      zoneOnePrice: Math.max(0, numberField(form, `overseas_zone_1_price_${index}`) ?? priceForTier(currentZoneOne, index, 11)),
      zoneTwoPrice: Math.max(0, numberField(form, `overseas_zone_2_price_${index}`) ?? priceForTier(currentZoneTwo, index, 20))
    }));
    const zoneTwoPostalCodes = normalizePostalCodes(textField(form, 'overseas_zone_2_postal_codes'));
    const featuredBrands = [
      ...new Map(
        textField(form, 'shop_featured_brands')
          .split(/\r?\n|,/)
          .map((brand) => brand.trim())
          .filter(Boolean)
          .map((brand) => [brand.toLocaleLowerCase('hr'), brand])
      ).values()
    ];

    const updates: Record<string, unknown> = {
      admin_email: textField(form, 'admin_email') || 'info@petroni.hr',
      email_from: textField(form, 'email_from') || 'Petroni <onboarding@resend.dev>',
      company,
      ibans,
      free_shipping_threshold: Math.max(0, numberField(form, 'free_shipping_threshold') ?? 1000),
      min_driver_age: numberField(form, 'min_driver_age') ?? 28,
      km_per_day_included: numberField(form, 'km_per_day_included') ?? 300,
      split_payment_due_days: Math.max(1, Math.trunc(numberField(form, 'split_payment_due_days') ?? 45)),
      split_payment_min_advance_days: Math.max(1, Math.trunc(numberField(form, 'split_payment_min_advance_days') ?? 45)),
      booking_time_selection_start: bookingTimeStart,
      booking_time_selection_end: bookingTimeEnd,
      shop_featured_brands: featuredBrands,
      shop_shipping_methods: {
        overseas: { enabled: checkboxField(form, 'overseas_enabled'), price: overseasTiers[0].zoneOnePrice, allows_cod: checkboxField(form, 'overseas_allows_cod'), label_hr: 'Overseas dostava', label_en: 'Overseas delivery' },
        boxnow: { enabled: checkboxField(form, 'boxnow_enabled'), price: numberField(form, 'boxnow_price') ?? 9, allows_cod: checkboxField(form, 'boxnow_allows_cod'), label_hr: 'BoxNow paketomat', label_en: 'BoxNow locker' },
        personal_pickup: { enabled: checkboxField(form, 'personal_pickup_enabled'), price: 0, allows_cod: checkboxField(form, 'personal_pickup_allows_cod'), label_hr: 'Osobno preuzimanje', label_en: 'Personal pickup' }
      },
      shop_overseas_zones: {
        zone_1: {
          label_hr: 'Zona I',
          label_en: 'Zone I',
          tiers: overseasTiers.map((tier) => ({ ...tier.range, price: tier.zoneOnePrice }))
        },
        zone_2: {
          label_hr: 'Zona II',
          label_en: 'Zone II',
          postal_codes: zoneTwoPostalCodes,
          tiers: overseasTiers.map((tier) => ({ ...tier.range, price: tier.zoneTwoPrice }))
        }
      },
      cash_on_delivery_enabled: checkboxField(form, 'cash_on_delivery_enabled'),
      cash_on_delivery_surcharge: numberField(form, 'cash_on_delivery_surcharge') ?? 1
    };

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
