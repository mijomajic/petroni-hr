import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Handle } from '@sveltejs/kit';
import { legacyRedirectDecision } from '$lib/legacy-redirects';

function safeReferrer(value: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (['/admin', '/api', '/auth', '/checkout', '/platforma', '/postavi-lozinku', '/rezerviraj/success']
      .some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
      return url.origin;
    }
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

function shouldLogPublic404(pathname: string) {
  return !['/admin', '/api', '/auth', '/platforma'].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export const handle: Handle = async ({ event, resolve }) => {
  const legacyDecision = legacyRedirectDecision(event.url.pathname, event.url.searchParams);
  if (legacyDecision?.status === 308) {
    const targetUrl = new URL(legacyDecision.target, event.url.origin);
    if (legacyDecision.preserveSearch !== false) targetUrl.search = event.url.search;
    if (legacyDecision.locale) targetUrl.searchParams.set('lang', legacyDecision.locale);
    return new Response(null, {
      status: 308,
      headers: { Location: targetUrl.toString(), 'Cache-Control': 'public, max-age=3600' }
    });
  }

  if (legacyDecision?.status === 410) {
    console.info(JSON.stringify({
      event: 'legacy_gone',
      timestamp: new Date().toISOString(),
      method: event.request.method,
      path: event.url.pathname,
      reason: legacyDecision.reason,
      referrer: safeReferrer(event.request.headers.get('referer'))
    }));
    return new Response('Sadržaj više nije dostupan.', {
      status: 410,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'noindex'
      }
    });
  }

  event.locals.supabase = createServerClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            event.cookies.set(name, value, { ...options, path: '/' });
          }
        }
      }
    }
  );

  event.locals.safeGetSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();

    if (!session) return { session: null, user: null };

    const {
      data: { user },
      error
    } = await event.locals.supabase.auth.getUser();

    if (error) return { session: null, user: null };
    return { session, user };
  };

  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) =>
      name === 'content-range' || name === 'x-supabase-api-version'
  });

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  if (response.status === 404 && shouldLogPublic404(event.url.pathname)) {
    console.warn(JSON.stringify({
      event: 'public_404',
      timestamp: new Date().toISOString(),
      method: event.request.method,
      path: event.url.pathname,
      referrer: safeReferrer(event.request.headers.get('referer'))
    }));
  }

  return response;
};
