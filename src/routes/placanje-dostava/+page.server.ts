import { normalizeCheckoutConfig } from '$lib/shop-checkout';
import { supabaseAdmin } from '$lib/supabase.server';
import { getPublishedLegalDocument } from '$lib/legal-documents.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [{ data }, document] = await Promise.all([
    supabaseAdmin.from('settings').select('key,value').in('key', [
      'shop_shipping_methods',
      'shop_overseas_zones',
      'free_shipping_threshold',
      'cash_on_delivery_enabled',
      'cash_on_delivery_surcharge'
    ]),
    getPublishedLegalDocument('delivery_payment')
  ]);
  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  return { checkoutConfig: normalizeCheckoutConfig(settings), document };
};
