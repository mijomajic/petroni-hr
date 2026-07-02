import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { data, error } = await locals.supabase
    .from('vehicles')
    .select('*')
    .eq('type', 'sale')
    .order('sort_order');

  return { vehicles: data ?? [], loadError: error?.message ?? null };
};
