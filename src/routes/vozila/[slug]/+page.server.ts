import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { data, error: queryError } = await locals.supabase
    .from('vehicles')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (queryError || !data) error(404, 'Vozilo nije pronađeno.');
  return { vehicle: data };
};
