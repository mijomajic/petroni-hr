import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const code = url.searchParams.get('code');
  const requestedNext = url.searchParams.get('next') ?? '/moj-racun';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/moj-racun';

  if (tokenHash && type) {
    const { error } = await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) redirect(303, next);
  }

  if (code) {
    const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(303, next);
  }

  redirect(303, '/prijava?error=potvrda');
};
