import { fail } from '@sveltejs/kit';
import { integerField, optionalTextField, slugField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import { uniqueProductBrands } from '$lib/product-brands';
import type { Actions, PageServerLoad } from './$types';

const PAGE_SIZE = 50;

export const load: PageServerLoad = async ({ url }) => {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const query = (url.searchParams.get('q') ?? '').trim();
  const category = url.searchParams.get('category') ?? '';
  const brand = url.searchParams.get('brand') ?? '';
  const status = url.searchParams.get('status') ?? '';
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let productsQuery = supabaseAdmin
    .from('products')
    .select('id,slug,name_hr,price,category_id,brand,images,stock,sku,is_active,created_at,product_categories(name_hr)', { count: 'exact' });
  if (query) productsQuery = productsQuery.or(`name_hr.ilike.%${query.replace(/[%_,]/g, ' ')}%,sku.ilike.%${query.replace(/[%_,]/g, ' ')}%`);
  if (category) productsQuery = productsQuery.eq('category_id', category);
  if (brand) productsQuery = productsQuery.ilike('brand', brand);
  if (status === 'active') productsQuery = productsQuery.eq('is_active', true);
  if (status === 'inactive') productsQuery = productsQuery.eq('is_active', false);

  const [products, categories, productBrands] = await Promise.all([
    productsQuery.order('created_at', { ascending: false }).range(from, to),
    supabaseAdmin.from('product_categories').select('*').order('sort_order', { ascending: true }).order('name_hr', { ascending: true }),
    supabaseAdmin.from('products').select('brand').not('brand', 'is', null).range(0, 5000)
  ]);
  if (products.error) throw new Error(products.error.message);
  if (categories.error) throw new Error(categories.error.message);
  if (productBrands.error) throw new Error(productBrands.error.message);
  return {
    products: products.data ?? [],
    total: products.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    filters: { query, category, brand, status },
    categories: categories.data ?? [],
    brands: uniqueProductBrands(productBrands.data ?? [])
  };
};

export const actions: Actions = {
  toggle: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = textField(form, 'id');
    const next = textField(form, 'next') === 'true';
    const { data: before } = await supabaseAdmin.from('products').select('id,name_hr,is_active').eq('id', id).single();
    if (!before) return fail(404, { message: 'Proizvod nije pronađen.' });
    const { data: after, error } = await supabaseAdmin.from('products').update({ is_active: next }).eq('id', id).select('id,name_hr,is_active').single();
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'product', entityId: id, action: 'product_active_changed', beforeState: before, afterState: after });
    return { message: 'Status proizvoda je spremljen.' };
  },

  deleteProduct: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = textField(form, 'id');
    const { data: before } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
    if (!before) return fail(404, { message: 'Proizvod nije pronađen.' });
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'product', entityId: id, action: 'product_deleted', beforeState: before });
    return { message: 'Proizvod je obrisan.' };
  },

  saveCategory: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = optionalTextField(form, 'id');
    const name = textField(form, 'name_hr');
    if (!name) return fail(400, { message: 'Kategorija mora imati naziv.' });
    const parentId = optionalTextField(form, 'parent_id');
    if (parentId === id) return fail(400, { message: 'Kategorija ne može biti vlastita nadkategorija.' });
    if (parentId) {
      const { data: parent } = await supabaseAdmin.from('product_categories').select('id,parent_id').eq('id', parentId).single();
      if (!parent) return fail(400, { message: 'Odabrana nadkategorija ne postoji.' });
      if (parent.parent_id) return fail(400, { message: 'Nadkategorija mora biti glavna kategorija, ne podkategorija.' });
      if (id) {
        const { count: childCount } = await supabaseAdmin.from('product_categories').select('id', { count: 'exact', head: true }).eq('parent_id', id);
        if ((childCount ?? 0) > 0) return fail(400, { message: 'Kategorija s podkategorijama ne može postati podkategorija.' });
      }
    }
    const payload = {
      name_hr: name,
      name_en: optionalTextField(form, 'name_en'),
      slug: slugField(form, 'slug', name),
      parent_id: parentId,
      sort_order: integerField(form, 'sort_order') ?? 0
    };

    if (id) {
      const { data: before } = await supabaseAdmin.from('product_categories').select('*').eq('id', id).single();
      const { data: after, error } = await supabaseAdmin.from('product_categories').update(payload).eq('id', id).select().single();
      if (error) return fail(400, { message: error.message });
      await recordAdminEvent({ administrator, entityType: 'product_category', entityId: id, action: 'product_category_updated', beforeState: before, afterState: after });
      return { message: 'Kategorija je spremljena.' };
    }

    const { data, error } = await supabaseAdmin.from('product_categories').insert(payload).select().single();
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'product_category', entityId: data.id, action: 'product_category_created', afterState: data });
    return { message: 'Kategorija je dodana.' };
  },

  deleteCategory: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = textField(form, 'id');
    const { data: before } = await supabaseAdmin.from('product_categories').select('*').eq('id', id).single();
    if (!before) return fail(404, { message: 'Kategorija nije pronađena.' });
    const { error } = await supabaseAdmin.from('product_categories').delete().eq('id', id);
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'product_category', entityId: id, action: 'product_category_deleted', beforeState: before });
    return { message: 'Kategorija je obrisana.' };
  }
};
