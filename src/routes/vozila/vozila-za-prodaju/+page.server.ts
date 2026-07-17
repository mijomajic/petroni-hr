import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  let { data, error } = await locals.supabase
    .from('vehicles')
    .select('*')
    .or('type.eq.sale,is_for_sale.eq.true')
    .order('sort_order');

  // Keep the public catalogue usable during the short deploy window before
  // migration 0016 reaches Supabase. Once the column exists, rentals flagged
  // for sale are included by the primary query above.
  if (error?.message.includes('is_for_sale')) {
    const fallback = await locals.supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'sale')
      .order('sort_order');
    data = fallback.data;
    error = fallback.error;
  }

  return { vehicles: data ?? [], loadError: error?.message ?? null };
};
