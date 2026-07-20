import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { normalizeStockNotificationEmail, stockNotificationEmailIsValid } from '$lib/stock-notifications';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Neispravan zahtjev.' }, { status: 400 });
  }

  // Honeypot submissions receive a generic success response without storing data.
  if (String(body.website ?? '').trim()) return json({ success: true });

  const productId = String(body.productId ?? '').trim();
  const email = normalizeStockNotificationEmail(body.email);
  const locale = body.locale === 'en' ? 'en' : 'hr';
  if (!productId || !stockNotificationEmailIsValid(email)) {
    return json({ success: false, error: locale === 'hr' ? 'Unesite valjanu email adresu.' : 'Enter a valid email address.' }, { status: 400 });
  }

  const { data: product, error: productError } = await supabaseAdmin
    .from('shop_products_available')
    .select('id,available_stock,is_active')
    .eq('id', productId)
    .eq('is_active', true)
    .single();
  if (productError || !product) {
    return json({ success: false, error: locale === 'hr' ? 'Proizvod nije dostupan.' : 'The product is unavailable.' }, { status: 404 });
  }
  if (Number(product.available_stock) > 0) {
    return json({ success: false, error: locale === 'hr' ? 'Proizvod je već na zalihi.' : 'The product is already in stock.' }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { error: insertError } = await supabaseAdmin
    .from('product_stock_notifications')
    .upsert(
      {
        product_id: productId,
        email,
        locale,
        status: 'pending',
        requested_at: now,
        notified_at: null,
        last_error: null
      },
      { onConflict: 'product_id,email' }
    );
  if (insertError) {
    return json({ success: false, error: locale === 'hr' ? 'Prijavu trenutačno nije moguće spremiti.' : 'The alert could not be saved right now.' }, { status: 500 });
  }

  return json({ success: true });
};
