import { redirect } from '@sveltejs/kit';
import {
  isPasswordRecoveryPath,
  passwordContext,
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_INTENT_COOKIE
} from '$lib/password-security';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals, cookies }) => {
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const code = url.searchParams.get('code');
  const requestedNext = url.searchParams.get('next') ?? (type === 'recovery' ? '/postavi-lozinku' : '/moj-racun');
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/moj-racun';

  const markRecoverySession = () => {
    cookies.set(PASSWORD_RECOVERY_COOKIE, '1', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      maxAge: 20 * 60
    });
    cookies.delete(PASSWORD_RECOVERY_INTENT_COOKIE, { path: '/' });
  };

  if (tokenHash && type) {
    const { error } = await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      if (type === 'recovery' && isPasswordRecoveryPath(next)) markRecoverySession();
      redirect(303, next);
    }
  }

  if (code) {
    const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const recoveryContext = passwordContext(new URL(next, url.origin).searchParams.get('context'));
      const hasRecoveryIntent = cookies.get(PASSWORD_RECOVERY_INTENT_COOKIE) === recoveryContext;
      if (isPasswordRecoveryPath(next) && hasRecoveryIntent) {
        markRecoverySession();
        redirect(303, next);
      }
      if (!isPasswordRecoveryPath(next)) redirect(303, next);
    }
  }

  if (type === 'recovery' || isPasswordRecoveryPath(next)) {
    const context = passwordContext(new URL(next, url.origin).searchParams.get('context'));
    cookies.delete(PASSWORD_RECOVERY_INTENT_COOKIE, { path: '/' });
    redirect(303, `/zaboravljena-lozinka?context=${context}&error=link`);
  }

  redirect(303, '/prijava?error=potvrda');
};
