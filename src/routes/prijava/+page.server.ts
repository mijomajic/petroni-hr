import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '/moj-racun';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/moj-racun';
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const { user } = await locals.safeGetSession();
  if (user) redirect(303, safeNext(url.searchParams.get('next')));
  return {
    next: safeNext(url.searchParams.get('next')),
    confirmationError: url.searchParams.get('error') === 'potvrda'
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const next = safeNext(form.get('next'));

    if (!email || !password) {
      return fail(400, { error: 'Unesite email adresu i lozinku.', email });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return fail(400, {
        error: 'Prijava nije uspjela. Provjerite email adresu i lozinku.',
        email
      });
    }

    redirect(303, next);
  }
};
