import { json } from '@sveltejs/kit';
import { sendContactInquiry } from '$lib/email.server';
import type { RequestHandler } from './$types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: RequestHandler = async ({ request, url }) => {
  const body = await request.json().catch(() => ({}));
  if (String(body.website ?? '').trim()) return json({ success: true });

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const topic = String(body.topic ?? '').trim();
  const message = String(body.message ?? '').trim();
  const product = String(body.product ?? '').trim();
  const productPath = String(body.productPath ?? '').trim();

  if (!name || !emailPattern.test(email) || !topic || !message) {
    return json({ success: false, error: 'Ispunite ime, valjanu email adresu, temu i poruku.' }, { status: 400 });
  }
  if (name.length > 120 || email.length > 180 || phone.length > 60 || topic.length > 80 || message.length > 4000 || product.length > 240) {
    return json({ success: false, error: 'Jedno ili više polja je predugačko.' }, { status: 400 });
  }

  const sent = await sendContactInquiry({
    name,
    email,
    phone,
    topic,
    message,
    product,
    productUrl: productPath.startsWith('/') ? `${url.origin}${productPath}` : undefined
  });
  if (!sent) return json({ success: false, error: 'Poruku trenutno nije moguće poslati. Javite nam se na info@petroni.hr.' }, { status: 502 });
  return json({ success: true });
};
