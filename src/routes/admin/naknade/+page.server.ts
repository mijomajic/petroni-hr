import { fail } from '@sveltejs/kit';
import { checkboxField, integerField, numberField, optionalTextField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [fees, locations] = await Promise.all([
    supabaseAdmin.from('fees').select('*').order('key', { ascending: true }),
    supabaseAdmin.from('rental_locations').select('*').order('sort_order', { ascending: true })
  ]);
  if (fees.error) throw new Error(fees.error.message);
  if (locations.error) throw new Error(locations.error.message);
  return { fees: fees.data ?? [], locations: locations.data ?? [] };
};

export const actions: Actions = {
  saveFee: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = textField(form, 'id');
    const payload = {
      name_hr: textField(form, 'name_hr'),
      description_hr: optionalTextField(form, 'description_hr'),
      amount: numberField(form, 'amount') ?? 0,
      fee_type: textField(form, 'fee_type'),
      is_active: checkboxField(form, 'is_active')
    };
    if (!payload.name_hr || !payload.fee_type) return fail(400, { message: 'Naknada mora imati naziv i tip.' });
    const { data: before } = await supabaseAdmin.from('fees').select('*').eq('id', id).single();
    const { data: after, error } = await supabaseAdmin.from('fees').update(payload).eq('id', id).select().single();
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'fee', entityId: id, action: 'fee_updated', beforeState: before, afterState: after });
    return { message: 'Naknada je spremljena.' };
  },

  saveLocation: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = optionalTextField(form, 'id');
    const payload = {
      name: textField(form, 'name'),
      location_fee: numberField(form, 'location_fee') ?? 0,
      pickup_window: optionalTextField(form, 'pickup_window'),
      return_window: optionalTextField(form, 'return_window'),
      time_policy: textField(form, 'time_policy') || 'agreement_hr',
      after_hours_start: optionalTextField(form, 'after_hours_start'),
      sort_order: integerField(form, 'sort_order') ?? 0
    };
    if (!payload.name) return fail(400, { message: 'Lokacija mora imati naziv.' });
    if (!['zagreb_automatic', 'agreement_hr', 'agreement_overseas'].includes(payload.time_policy)) {
      return fail(400, { message: 'Odabrano pravilo termina nije valjano.' });
    }

    if (id) {
      const { data: before } = await supabaseAdmin.from('rental_locations').select('*').eq('id', id).single();
      const { data: after, error } = await supabaseAdmin.from('rental_locations').update(payload).eq('id', id).select().single();
      if (error) return fail(400, { message: error.message });
      await recordAdminEvent({ administrator, entityType: 'rental_location', entityId: id, action: 'rental_location_updated', beforeState: before, afterState: after });
      return { message: 'Lokacija je spremljena.' };
    }

    const { data, error } = await supabaseAdmin.from('rental_locations').insert(payload).select().single();
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'rental_location', entityId: data.id, action: 'rental_location_created', afterState: data });
    return { message: 'Lokacija je dodana.' };
  },

  deleteLocation: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = textField(form, 'id');
    const { data: before } = await supabaseAdmin.from('rental_locations').select('*').eq('id', id).single();
    if (!before) return fail(404, { message: 'Lokacija nije pronađena.' });
    const { error } = await supabaseAdmin.from('rental_locations').delete().eq('id', id);
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'rental_location', entityId: id, action: 'rental_location_deleted', beforeState: before });
    return { message: 'Lokacija je obrisana.' };
  }
};
