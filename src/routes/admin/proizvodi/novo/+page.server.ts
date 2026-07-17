import { redirect } from '@sveltejs/kit';
import { checkboxField, integerField, linesField, numberField, optionalTextField, slugField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import { uniqueProductBrands } from '$lib/product-brands';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [categories, productBrands] = await Promise.all([
    supabaseAdmin.from('product_categories').select('*').order('sort_order'),
    supabaseAdmin.from('products').select('brand').not('brand', 'is', null).range(0, 5000)
  ]);
  if (categories.error) throw new Error(categories.error.message);
  if (productBrands.error) throw new Error(productBrands.error.message);
  return {
    categories: categories.data ?? [],
    brands: uniqueProductBrands(productBrands.data ?? [])
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
    brand: optionalTextField(form, 'brand'),
    images: linesField(form, 'images'),
    stock: integerField(form, 'stock') ?? 0,
    sku: optionalTextField(form, 'sku'),
    pickup_only: checkboxField(form, 'pickup_only'),
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
