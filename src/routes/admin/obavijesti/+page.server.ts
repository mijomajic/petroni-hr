import { fail } from '@sveltejs/kit';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import { notifyProductStockSubscribers } from '$lib/stock-notifications.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const status = ['pending', 'sent', 'cancelled'].includes(url.searchParams.get('status') ?? '')
    ? String(url.searchParams.get('status'))
    : 'pending';
  let query = supabaseAdmin
    .from('product_stock_notifications')
    .select('id,product_id,email,locale,status,requested_at,notified_at,last_attempt_at,attempt_count,last_error,products(name_hr,slug,stock,is_active)')
    .order('requested_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);
  const [{ data, error }, pending] = await Promise.all([
    query,
    supabaseAdmin.from('product_stock_notifications').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  ]);
  if (error) throw new Error(error.message);
  return { notifications: data ?? [], status, pendingCount: pending.count ?? 0 };
};

export const actions: Actions = {
  sendForProduct: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const productId = String(form.get('product_id') ?? '').trim();
    if (!productId) return fail(400, { message: 'Proizvod nije odabran.' });
    try {
      const result = await notifyProductStockSubscribers(productId, administrator.user.id);
      await recordAdminEvent({
        administrator,
        entityType: 'product',
        entityId: productId,
        action: 'product_stock_notifications_retried',
        metadata: result
      });
      return {
        message: result.pending === 0
          ? 'Nema prijava spremnih za slanje ili proizvod još nije na zalihi.'
          : `Poslano: ${result.sent}; neuspjelo: ${result.failed}.`
      };
    } catch (sendError) {
      return fail(500, { message: sendError instanceof Error ? sendError.message : 'Obavijesti nije moguće poslati.' });
    }
  }
};
