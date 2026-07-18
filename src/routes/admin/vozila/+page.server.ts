import { fail } from '@sveltejs/kit';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [vehicles, blockedDates] = await Promise.all([
    supabaseAdmin
      .from('vehicles')
      .select('id,slug,name,type,category,seats,beds,bags,base_price_per_day,sale_price,images,is_available,is_for_sale,sort_order,created_at')
      .order('type', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('vehicle_blocked_dates')
      .select('id,vehicle_id,date_from,date_to,reason,vehicles(name)')
      .order('date_from', { ascending: true })
      .limit(40)
  ]);

  if (vehicles.error) throw new Error(vehicles.error.message);
  if (blockedDates.error) throw new Error(blockedDates.error.message);

  return {
    vehicles: vehicles.data ?? [],
    blockedDates: blockedDates.data ?? []
  };
};

export const actions: Actions = {
  toggle: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = String(form.get('id') ?? '');
    const next = String(form.get('next')) === 'true';

    const { data: before } = await supabaseAdmin
      .from('vehicles')
      .select('id,name,is_available')
      .eq('id', id)
      .single();
    if (!before) return fail(404, { message: 'Vozilo nije pronađeno.' });

    const { data: after, error } = await supabaseAdmin
      .from('vehicles')
      .update({ is_available: next })
      .eq('id', id)
      .select('id,name,is_available')
      .single();
    if (error) return fail(400, { message: error.message });

    await recordAdminEvent({
      administrator,
      entityType: 'vehicle',
      entityId: id,
      action: 'vehicle_availability_changed',
      beforeState: before,
      afterState: after
    });
    return { message: 'Status vozila je spremljen.' };
  },

  delete: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = String(form.get('id') ?? '');

    const { data: before } = await supabaseAdmin.from('vehicles').select('*').eq('id', id).single();
    if (!before) return fail(404, { message: 'Vozilo nije pronađeno.' });

    const { error } = await supabaseAdmin.from('vehicles').delete().eq('id', id);
    if (error) return fail(400, { message: error.message });

    await recordAdminEvent({
      administrator,
      entityType: 'vehicle',
      entityId: id,
      action: 'vehicle_deleted',
      beforeState: before
    });
    return { message: 'Vozilo je obrisano.' };
  },

  deleteBlock: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = String(form.get('id') ?? '');
    const { data: before } = await supabaseAdmin
      .from('vehicle_blocked_dates')
      .select('*')
      .eq('id', id)
      .single();
    if (!before) return fail(404, { message: 'Blokada nije pronađena.' });
    const { error } = await supabaseAdmin.from('vehicle_blocked_dates').delete().eq('id', id);
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({
      administrator,
      entityType: 'vehicle_blocked_date',
      entityId: id,
      action: 'vehicle_block_deleted',
      beforeState: before,
      metadata: { vehicle_id: before.vehicle_id }
    });
    return { message: 'Blokirani termin je uklonjen.' };
  }
};
