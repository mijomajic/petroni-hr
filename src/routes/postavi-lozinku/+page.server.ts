import { fail, redirect } from '@sveltejs/kit';
import {
  PASSWORD_RECOVERY_COOKIE,
  passwordContext,
  passwordLoginPath,
  passwordValidationError
} from '$lib/password-security';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies, url }) => {
  const context = passwordContext(url.searchParams.get('context'));
  const { user } = await locals.safeGetSession();
  if (!user || cookies.get(PASSWORD_RECOVERY_COOKIE) !== '1') {
    redirect(303, `/zaboravljena-lozinka?context=${context}&error=link`);
  }
  return { context, email: user.email ?? '' };
};

export const actions: Actions = {
  default: async ({ request, locals, cookies }) => {
    const form = await request.formData();
    const context = passwordContext(form.get('context'));
    const { user } = await locals.safeGetSession();
    if (!user || cookies.get(PASSWORD_RECOVERY_COOKIE) !== '1') {
      return fail(403, { errorCode: 'recovery_expired', context });
    }

    const password = String(form.get('password') ?? '');
    const passwordConfirm = String(form.get('password_confirm') ?? '');
    const errorCode = passwordValidationError({ password, passwordConfirm });
    if (errorCode) return fail(400, { errorCode, context });

    const { error } = await locals.supabase.auth.updateUser({ password });
    if (error) return fail(400, { errorCode: 'auth_error', context });

    cookies.delete(PASSWORD_RECOVERY_COOKIE, { path: '/' });
    await locals.supabase.auth.signOut({ scope: 'global' });
    redirect(303, passwordLoginPath(context, true));
  }
};
