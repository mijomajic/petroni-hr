import { error, fail } from '@sveltejs/kit';
import {
  actionError,
  checkboxField,
  integerField,
  jsonObjectField,
  jsonPretty,
  linesField,
  numberField,
  optionalTextField,
  slugField,
  textField
} from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

function vehiclePayload(form: FormData) {
  const name = textField(form, 'name');
  if (!name) throw new Error('Unesite naziv vozila.');
  return {
    name,
    slug: slugField(form, 'slug', name),
    type: textField(form, 'type') || 'rental',
    category: optionalTextField(form, 'category'),
    seats: integerField(form, 'seats'),
    beds: integerField(form, 'beds'),
    bags: integerField(form, 'bags'),
    max_adults: integerField(form, 'max_adults'),
    max_children: integerField(form, 'max_children'),
    base_price_per_day: numberField(form, 'base_price_per_day'),
    sale_price: numberField(form, 'sale_price'),
    description_hr: optionalTextField(form, 'description_hr'),
    description_en: optionalTextField(form, 'description_en'),
    images: linesField(form, 'images'),
    bed_dimensions_hr: linesField(form, 'bed_dimensions_hr'),
    bed_dimensions_en: linesField(form, 'bed_dimensions_en'),
    specs: jsonObjectField(form, 'specs_json'),
    is_available: checkboxField(form, 'is_available'),
    is_for_sale: checkboxField(form, 'is_for_sale'),
    sort_order: integerField(form, 'sort_order') ?? 0
  };
}

export const load: PageServerLoad = async ({ params }) => {
  const [vehicle, blocks] = await Promise.all([
    supabaseAdmin.from('vehicles').select('*').eq('id', params.id).single(),
    supabaseAdmin
      .from('vehicle_blocked_dates')
      .select('*')
      .eq('vehicle_id', params.id)
      .order('date_from', { ascending: true })
  ]);
  if (vehicle.error || !vehicle.data) throw error(404, 'Vozilo nije pronađeno.');
  if (blocks.error) throw new Error(blocks.error.message);
  return {
    vehicle: {
      ...vehicle.data,
      images_text: (vehicle.data.images ?? []).join('\n'),
      bed_dimensions_hr_text: (vehicle.data.bed_dimensions_hr ?? []).join('\n'),
      bed_dimensions_en_text: (vehicle.data.bed_dimensions_en ?? []).join('\n'),
      specs_text: jsonPretty(vehicle.data.specs)
    },
    blockedDates: blocks.data ?? []
  };
};

export const actions: Actions = {
  save: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    let payload: ReturnType<typeof vehiclePayload>;
    try {
      payload = vehiclePayload(form);
    } catch (saveError) {
      return actionError(saveError instanceof Error ? saveError.message : 'Vozilo nije spremljeno.');
    }

    const { data: before } = await supabaseAdmin.from('vehicles').select('*').eq('id', params.id).single();
    if (!before) return fail(404, { message: 'Vozilo nije pronađeno.' });
    const { data: after, error: updateError } = await supabaseAdmin
      .from('vehicles')
      .update(payload)
      .eq('id', params.id)
      .select()
      .single();
    if (updateError) return actionError(updateError.message);

    await recordAdminEvent({
      administrator,
      entityType: 'vehicle',
      entityId: params.id,
      action: 'vehicle_updated',
      beforeState: before,
      afterState: after
    });
    return { message: 'Vozilo je spremljeno.' };
  },

  addBlock: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const dateFrom = textField(form, 'date_from');
    const dateTo = textField(form, 'date_to');
    if (!dateFrom || !dateTo || dateTo < dateFrom) {
      return fail(400, { message: 'Unesite ispravan raspon datuma.' });
    }
    const payload = {
      vehicle_id: params.id,
      date_from: dateFrom,
      date_to: dateTo,
      reason: optionalTextField(form, 'reason')
    };
    const { data, error: insertError } = await supabaseAdmin
      .from('vehicle_blocked_dates')
      .insert(payload)
      .select()
      .single();
    if (insertError) return fail(400, { message: insertError.message });
    await recordAdminEvent({
      administrator,
      entityType: 'vehicle_blocked_date',
      entityId: data.id,
      action: 'vehicle_block_created',
      afterState: data,
      metadata: { vehicle_id: params.id }
    });
    return { message: 'Blokirani termin je dodan.' };
  },

  deleteBlock: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = String(form.get('id') ?? '');
    const { data: before } = await supabaseAdmin
      .from('vehicle_blocked_dates')
      .select('*')
      .eq('id', id)
      .eq('vehicle_id', params.id)
      .single();
    if (!before) return fail(404, { message: 'Blokada nije pronađena.' });
    const { error: deleteError } = await supabaseAdmin.from('vehicle_blocked_dates').delete().eq('id', id);
    if (deleteError) return fail(400, { message: deleteError.message });
    await recordAdminEvent({
      administrator,
      entityType: 'vehicle_blocked_date',
      entityId: id,
      action: 'vehicle_block_deleted',
      beforeState: before,
      metadata: { vehicle_id: params.id }
    });
    return { message: 'Blokirani termin je uklonjen.' };
  }
};
