import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '/moj-racun';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/moj-racun';
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const { user } = await locals.safeGetSession();
  if (user) redirect(303, safeNext(url.searchParams.get('next')));
  return { next: safeNext(url.searchParams.get('next')) };
};

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const form = await request.formData();
    const firstName = String(form.get('first_name') ?? '').trim();
    const lastName = String(form.get('last_name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const passwordConfirm = String(form.get('password_confirm') ?? '');
    const next = safeNext(form.get('next'));
    const values = { firstName, lastName, email, phone };

    if (!firstName || !lastName || !email || !phone || !password || !passwordConfirm) {
      return fail(400, { error: 'Ispunite sva obavezna polja.', values });
    }
    if (password.length < 8) {
      return fail(400, { error: 'Lozinka mora sadržavati najmanje 8 znakova.', values });
    }
    if (password !== passwordConfirm) {
      return fail(400, { error: 'Lozinke se ne podudaraju.', values });
    }

    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${url.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          phone,
          address: '',
          city: '',
          zip: '',
          country: 'Hrvatska'
        }
      }
    });

    if (error) {
      return fail(400, {
        error: error.message.toLowerCase().includes('already')
          ? 'Račun s ovom email adresom već postoji.'
          : 'Registracija trenutačno nije uspjela. Pokušajte ponovno.',
        values
      });
    }

    if (data.session) redirect(303, next);
    return { success: true, email };
  }
};
