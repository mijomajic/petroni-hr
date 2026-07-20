import { sendProductAvailabilityNotification } from '$lib/email.server';
import { supabaseAdmin } from '$lib/supabase.server';

export type StockNotificationDeliveryResult = {
  pending: number;
  sent: number;
  failed: number;
};

export async function notifyProductStockSubscribers(
  productId: string,
  attemptedBy?: string
): Promise<StockNotificationDeliveryResult> {
  const { data: product, error: productError } = await supabaseAdmin
    .from('shop_products_available')
    .select('id,slug,name_hr,name_en,available_stock,is_active')
    .eq('id', productId)
    .single();
  if (productError || !product || !product.is_active || Number(product.available_stock) <= 0) {
    return { pending: 0, sent: 0, failed: 0 };
  }

  const { data: notifications, error: notificationsError } = await supabaseAdmin
    .from('product_stock_notifications')
    .select('id,email,locale,attempt_count')
    .eq('product_id', productId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: true });
  if (notificationsError) throw new Error(notificationsError.message);

  let sent = 0;
  let failed = 0;
  for (const notification of notifications ?? []) {
    const delivered = await sendProductAvailabilityNotification({
      notificationId: notification.id,
      email: notification.email,
      locale: notification.locale === 'en' ? 'en' : 'hr',
      product,
      attemptedBy
    });
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('product_stock_notifications')
      .update({
        status: delivered ? 'sent' : 'pending',
        notified_at: delivered ? now : null,
        last_attempt_at: now,
        attempt_count: Number(notification.attempt_count ?? 0) + 1,
        last_error: delivered ? null : 'Slanje e-maila nije uspjelo ili Resend nije konfiguriran.'
      })
      .eq('id', notification.id);
    if (updateError) throw new Error(updateError.message);
    if (delivered) sent += 1;
    else failed += 1;
  }

  return { pending: notifications?.length ?? 0, sent, failed };
}
