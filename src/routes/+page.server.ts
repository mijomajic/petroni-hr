import type { PageServerLoad } from './$types';
import { getSitePageForRequest } from '$lib/site-page-preview.server';

export const load: PageServerLoad = async ({ locals, url }) => {
  const [rentals, sales, pageContent] = await Promise.all([
    locals.supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'rental')
      .eq('is_available', true)
      .order('sort_order')
      .limit(6),
    locals.supabase.from('vehicles').select('*').eq('type', 'sale').order('sort_order').limit(3),
    getSitePageForRequest('home', url, locals)
  ]);

  return {
    rentalVehicles: rentals.data ?? [],
    saleVehicles: sales.data ?? [],
    pageContent
  };
};
