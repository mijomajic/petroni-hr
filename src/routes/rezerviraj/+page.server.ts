import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  const [vehicles, locations, extras] = await Promise.all([
    locals.supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'rental')
      .eq('is_available', true)
      .order('sort_order'),
    locals.supabase.from('rental_locations').select('*').order('sort_order'),
    locals.supabase.from('booking_extras').select('*').order('sort_order')
  ]);

  return {
    vehicles: vehicles.data ?? [],
    locations: locations.data ?? [],
    extras: extras.data ?? [],
    profile: user
      ? {
          ...user.user_metadata,
          email: user.email ?? ''
        }
      : null
  };
};
