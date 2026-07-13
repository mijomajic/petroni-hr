import { fail } from '@sveltejs/kit';
import { checkboxField, integerField, numberField, optionalTextField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { data, error } = await supabaseAdmin
    .from('booking_extras')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return { extras: data ?? [] };
};

function extraPayload(form: FormData) {
  const name = textField(form, 'name_hr');
  if (!name) throw new Error('Opcija mora imati naziv.');
  return {
    name_hr: name,
    name_en: optionalTextField(form, 'name_en'),
    description_hr: optionalTextField(form, 'description_hr'),
    price: numberField(form, 'price') ?? 0,
    price_type: textField(form, 'price_type') || 'per_rental',
    category: optionalTextField(form, 'category'),
    auto_apply_rule: optionalTextField(form, 'auto_apply_rule'),
    max_qty: integerField(form, 'max_qty') ?? 1,
    is_required: checkboxField(form, 'is_required'),
    sort_order: integerField(form, 'sort_order') ?? 0
  };
}

export const actions: Actions = {
  saveExtra: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = optionalTextField(form, 'id');
    let payload: ReturnType<typeof extraPayload>;
    try {
      payload = extraPayload(form);
    } catch (error) {
      return fail(400, { message: error instanceof Error ? error.message : 'Opcija nije spremljena.' });
    }

    if (id) {
      const { data: before } = await supabaseAdmin.from('booking_extras').select('*').eq('id', id).single();
      const { data: after, error } = await supabaseAdmin.from('booking_extras').update(payload).eq('id', id).select().single();
      if (error) return fail(400, { message: error.message });
      await recordAdminEvent({ administrator, entityType: 'booking_extra', entityId: id, action: 'booking_extra_updated', beforeState: before, afterState: after });
      return { message: 'Dodatna opcija je spremljena.' };
    }

    const { data, error } = await supabaseAdmin.from('booking_extras').insert(payload).select().single();
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'booking_extra', entityId: data.id, action: 'booking_extra_created', afterState: data });
    return { message: 'Dodatna opcija je dodana.' };
  },

  deleteExtra: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = textField(form, 'id');
    const { data: before } = await supabaseAdmin.from('booking_extras').select('*').eq('id', id).single();
    if (!before) return fail(404, { message: 'Opcija nije pronađena.' });
    const { error } = await supabaseAdmin.from('booking_extras').delete().eq('id', id);
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'booking_extra', entityId: id, action: 'booking_extra_deleted', beforeState: before });
    return { message: 'Dodatna opcija je obrisana.' };
  }
};
