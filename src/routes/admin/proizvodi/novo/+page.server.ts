import { redirect } from '@sveltejs/kit';
import { checkboxField, integerField, linesField, numberField, optionalTextField, slugField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { data, error } = await supabaseAdmin.from('product_categories').select('*').order('sort_order');
  if (error) throw new Error(error.message);
  return { categories: data ?? [] };
};

function productPayload(form: FormData) {
  const name = textField(form, 'name_hr');
  if (!name) throw new Error('Proizvod mora imati naziv.');
  return {
    name_hr: name,
    name_en: optionalTextField(form, 'name_en'),
    slug: slugField(form, 'slug', name),
    description_hr: optionalTextField(form, 'description_hr'),
    description_en: optionalTextField(form, 'description_en'),
    price: numberField(form, 'price') ?? 0,
    category_id: optionalTextField(form, 'category_id'),
    images: linesField(form, 'images'),
    stock: integerField(form, 'stock') ?? 0,
    sku: optionalTextField(form, 'sku'),
    is_active: checkboxField(form, 'is_active')
  };
}

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    let payload: ReturnType<typeof productPayload>;
    try {
      payload = productPayload(form);
    } catch (error) {
      return { message: error instanceof Error ? error.message : 'Proizvod nije spremljen.' };
    }
    const { data, error } = await supabaseAdmin.from('products').insert(payload).select().single();
    if (error) return { message: error.message };
    await recordAdminEvent({ administrator, entityType: 'product', entityId: data.id, action: 'product_created', afterState: data });
    throw redirect(303, `/admin/proizvodi/${data.id}`);
  }
};
