import { fail } from '@sveltejs/kit';
import {
  isEmailAddress,
  passwordContext,
  passwordLoginPath,
  passwordRecoveryPath,
  PASSWORD_RECOVERY_INTENT_COOKIE
} from '$lib/password-security';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const context = passwordContext(url.searchParams.get('context'));
  return {
    context,
    loginPath: passwordLoginPath(context),
    invalidLink: url.searchParams.get('error') === 'link'
  };
};

export const actions: Actions = {
  default: async ({ request, locals, url, cookies }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const website = String(form.get('website') ?? '').trim();
    const context = passwordContext(form.get('context'));

    if (website) return { sent: true, context };
    if (!isEmailAddress(email)) {
      return fail(400, { errorCode: 'invalid_email', email, context });
    }

    const callback = new URL('/auth/confirm', url.origin);
    callback.searchParams.set('next', passwordRecoveryPath(context));
    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callback.toString()
    });

    if (error) {
      return fail(429, {
        errorCode: 'send_failed',
        email,
        context
      });
    }

    cookies.set(PASSWORD_RECOVERY_INTENT_COOKIE, context, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      maxAge: 20 * 60
    });

    return { sent: true, context };
  }
};
