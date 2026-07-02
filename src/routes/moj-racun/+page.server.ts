import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/prijava?next=/moj-racun');

  const [bookings, orders] = await Promise.all([
    locals.supabase
      .from('bookings')
      .select('*, vehicles(name,slug,images)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    locals.supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  ]);

  return {
    profile: {
      email: user.email ?? '',
      firstName: String(user.user_metadata.first_name ?? ''),
      lastName: String(user.user_metadata.last_name ?? ''),
      phone: String(user.user_metadata.phone ?? ''),
      address: String(user.user_metadata.address ?? ''),
      city: String(user.user_metadata.city ?? ''),
      zip: String(user.user_metadata.zip ?? ''),
      country: String(user.user_metadata.country ?? 'Hrvatska')
    },
    bookings: bookings.data ?? [],
    orders: orders.data ?? []
  };
};

export const actions: Actions = {
  profile: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession();
    if (!user) redirect(303, '/prijava?next=/moj-racun');

    const form = await request.formData();
    const firstName = String(form.get('first_name') ?? '').trim();
    const lastName = String(form.get('last_name') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const address = String(form.get('address') ?? '').trim();
    const city = String(form.get('city') ?? '').trim();
    const zip = String(form.get('zip') ?? '').trim();
    const country = String(form.get('country') ?? '').trim();

    if (!firstName || !lastName) {
      return fail(400, { profileError: 'Ime i prezime su obavezni.' });
    }

    const { error } = await locals.supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        phone,
        address,
        city,
        zip,
        country
      }
    });

    if (error) return fail(400, { profileError: 'Profil nije spremljen. Pokušajte ponovno.' });
    return { profileSuccess: true };
  }
};
