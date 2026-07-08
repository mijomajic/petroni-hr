import { error } from '@sveltejs/kit';
import { checkboxField, integerField, linesField, numberField, optionalTextField, slugField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const [product, categories] = await Promise.all([
    supabaseAdmin.from('products').select('*').eq('id', params.id).single(),
    supabaseAdmin.from('product_categories').select('*').order('sort_order')
  ]);
  if (product.error || !product.data) throw error(404, 'Proizvod nije pronađen.');
  if (categories.error) throw new Error(categories.error.message);
  return {
    product: {
      ...product.data,
      images_text: (product.data.images ?? []).join('\n')
    },
    categories: categories.data ?? []
  };
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
  save: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    let payload: ReturnType<typeof productPayload>;
    try {
      payload = productPayload(form);
    } catch (saveError) {
      return { message: saveError instanceof Error ? saveError.message : 'Proizvod nije spremljen.' };
    }
    const { data: before } = await supabaseAdmin.from('products').select('*').eq('id', params.id).single();
    const { data: after, error } = await supabaseAdmin.from('products').update(payload).eq('id', params.id).select().single();
    if (error) return { message: error.message };
    await recordAdminEvent({ administrator, entityType: 'product', entityId: params.id, action: 'product_updated', beforeState: before, afterState: after });
    return { message: 'Proizvod je spremljen.' };
  }
};
