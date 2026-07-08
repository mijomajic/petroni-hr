import { redirect } from '@sveltejs/kit';
import {
  actionError,
  checkboxField,
  integerField,
  jsonObjectField,
  linesField,
  numberField,
  optionalTextField,
  slugField,
  textField
} from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions } from './$types';

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
    specs: jsonObjectField(form, 'specs_json'),
    is_available: checkboxField(form, 'is_available'),
    sort_order: integerField(form, 'sort_order') ?? 0
  };
}

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    let payload: ReturnType<typeof vehiclePayload>;
    try {
      payload = vehiclePayload(form);
    } catch (error) {
      return actionError(error instanceof Error ? error.message : 'Vozilo nije spremljeno.');
    }

    const { data, error } = await supabaseAdmin.from('vehicles').insert(payload).select().single();
    if (error) return actionError(error.message);

    await recordAdminEvent({
      administrator,
      entityType: 'vehicle',
      entityId: data.id,
      action: 'vehicle_created',
      afterState: data
    });
    throw redirect(303, `/admin/vozila/${data.id}`);
  }
};
