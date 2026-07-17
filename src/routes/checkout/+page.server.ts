import { corvuspayAvailable } from '$lib/payments.server';
import { normalizeCheckoutConfig } from '$lib/shop-checkout';
import { supabaseAdmin } from '$lib/supabase.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { data } = await supabaseAdmin.from('settings').select('key,value').in('key', [
    'shop_shipping_methods',
    'free_shipping_threshold',
    'cash_on_delivery_enabled',
    'cash_on_delivery_surcharge'
  ]);
  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  return {
    corvuspayAvailable: corvuspayAvailable(),
    checkoutConfig: normalizeCheckoutConfig(settings)
  };
};
