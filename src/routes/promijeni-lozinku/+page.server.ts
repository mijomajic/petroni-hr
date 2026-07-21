import { fail, redirect } from '@sveltejs/kit';
import { passwordContext, passwordLoginPath, passwordValidationError } from '$lib/password-security';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const context = passwordContext(url.searchParams.get('context'));
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, passwordLoginPath(context));
  return { context, email: user.email ?? '', loginPath: passwordLoginPath(context) };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const context = passwordContext(form.get('context'));
    const { user } = await locals.safeGetSession();
    if (!user) return fail(401, { errorCode: 'session_expired', context });

    const currentPassword = String(form.get('current_password') ?? '');
    const password = String(form.get('password') ?? '');
    const passwordConfirm = String(form.get('password_confirm') ?? '');
    const errorCode = passwordValidationError({
      currentPassword,
      password,
      passwordConfirm,
      requireCurrentPassword: true
    });
    if (errorCode) return fail(400, { errorCode, context });

    const { error } = await locals.supabase.auth.updateUser({
      password,
      current_password: currentPassword
    });
    if (error) return fail(400, { errorCode: 'auth_error', context });

    await locals.supabase.auth.signOut({ scope: 'global' });
    redirect(303, passwordLoginPath(context, true));
  }
};
