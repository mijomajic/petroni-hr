import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const [rentals, sales] = await Promise.all([
    locals.supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'rental')
      .eq('is_available', true)
      .order('sort_order')
      .limit(6),
    locals.supabase.from('vehicles').select('*').eq('type', 'sale').order('sort_order').limit(3)
  ]);

  return {
    rentalVehicles: rentals.data ?? [],
    saleVehicles: sales.data ?? []
  };
};
