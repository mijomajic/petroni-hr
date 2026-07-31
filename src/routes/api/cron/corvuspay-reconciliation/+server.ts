import { env } from '$env/dynamic/private';
import { timingSafeEqual } from 'node:crypto';
import { json } from '@sveltejs/kit';
import { runCorvuspayReconciliation } from '$lib/corvuspay-reconciliation.server';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 60 };

function authorized(request: Request): boolean {
  const secret = env.CRON_SECRET;
  const received = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!secret || !received) return false;
  const expectedBuffer = Buffer.from(secret);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export const GET: RequestHandler = async ({ request }) => {
  if (!env.CRON_SECRET) {
    return json({ ok: false, error: 'Cron zaštita nije konfigurirana.' }, { status: 503 });
  }
  if (!authorized(request)) {
    return json({ ok: false, error: 'Nije dopušteno.' }, { status: 401 });
  }

  try {
    const result = await runCorvuspayReconciliation('scheduled');
    return json({ ok: result.status === 'completed', ...result }, {
      headers: { 'cache-control': 'no-store' }
    });
  } catch (caught) {
    console.error('Scheduled CorvusPay reconciliation failed', caught);
    return json({ ok: false, error: 'CorvusPay kontrola nije dovršena.' }, { status: 500 });
  }
};
