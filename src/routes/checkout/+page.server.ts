import { corvuspayAvailable } from '$lib/payments.server';
import { normalizeCheckoutConfig } from '$lib/shop-checkout';
import { supabaseAdmin } from '$lib/supabase.server';
import { useStaticDemoData } from '$lib/demo-mode.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  if (useStaticDemoData) {
    return {
      corvuspayAvailable: false,
      checkoutConfig: normalizeCheckoutConfig({})
    };
  }

  const { data } = await supabaseAdmin.from('settings').select('key,value').in('key', [
    'shop_shipping_methods',
    'shop_overseas_zones',
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
