import type { PageServerLoad } from './$types';
import { useStaticDemoData } from '$lib/demo-mode.server';

export const load: PageServerLoad = async ({ locals }) => {
  if (useStaticDemoData) return { vehicles: [], loadError: null };

  const { data, error } = await locals.supabase
    .from('vehicles')
    .select('*')
    .eq('type', 'film')
    .eq('is_available', true)
    .order('sort_order');

  return { vehicles: data ?? [], loadError: error?.message ?? null };
};
