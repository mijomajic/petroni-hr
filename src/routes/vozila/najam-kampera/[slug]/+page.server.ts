import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DEMO_VEHICLES } from '$lib/demo-data';
import { useStaticDemoData } from '$lib/demo-mode.server';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (useStaticDemoData) {
    const vehicle = DEMO_VEHICLES.find((item) => item.slug === params.slug);
    if (!vehicle) error(404, 'Vehicle not found.');
    return { vehicle };
  }

  const { data, error: queryError } = await locals.supabase
    .from('vehicles')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_available', true)
    .single();

  if (queryError || !data) error(404, 'Vehicle not found.');
  return { vehicle: data };
};
