import { error } from '@sveltejs/kit';
import { checkboxField, integerField, linesField, numberField, optionalTextField, slugField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import { getActiveReservedQuantity } from '$lib/shop-stock.server';
import { getAdminProductBrands } from '$lib/product-brands.server';
import { notifyProductStockSubscribers } from '$lib/stock-notifications.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const [product, categories, brands, notifications] = await Promise.all([
    supabaseAdmin.from('products').select('*').eq('id', params.id).single(),
    supabaseAdmin.from('product_categories').select('*').order('sort_order'),
    getAdminProductBrands(),
    supabaseAdmin
      .from('product_stock_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', params.id)
      .eq('status', 'pending')
  ]);
  if (product.error || !product.data) throw error(404, 'Proizvod nije pronađen.');
  if (categories.error) throw new Error(categories.error.message);
  return {
    product: {
      ...product.data,
      images_text: (product.data.images ?? []).join('\n')
    },
    categories: categories.data ?? [],
    brands,
    pendingNotificationCount: notifications.count ?? 0
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
  save: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    let payload: ReturnType<typeof productPayload>;
    try {
      payload = productPayload(form);
    } catch (saveError) {
      return { message: saveError instanceof Error ? saveError.message : 'Proizvod nije spremljen.' };
    }
    const reserved = await getActiveReservedQuantity(params.id);
    if (reserved.error) return { message: reserved.error.message };
    if (payload.stock < reserved.quantity) {
      return {
        message: `Zaliha ne može biti manja od ${reserved.quantity}, jer je ta količina rezervirana u aktivnim narudžbama.`
      };
    }
    const { data: before } = await supabaseAdmin.from('products').select('*').eq('id', params.id).single();
    const { data: after, error } = await supabaseAdmin.from('products').update(payload).eq('id', params.id).select().single();
    if (error) return { message: error.message };
    await recordAdminEvent({ administrator, entityType: 'product', entityId: params.id, action: 'product_updated', beforeState: before, afterState: after });
    if (Number(after.stock) > 0) {
      try {
        const delivery = await notifyProductStockSubscribers(params.id, administrator.user.id);
        if (delivery.pending > 0) {
          return {
            message: delivery.failed > 0
              ? `Proizvod je spremljen. Poslano: ${delivery.sent}; neuspjelo: ${delivery.failed}. Neuspjele prijave ostaju spremne za ponovni pokušaj.`
              : `Proizvod je spremljen i poslano je ${delivery.sent} obavijesti o dostupnosti.`
          };
        }
      } catch (notificationError) {
        return {
          message: `Proizvod je spremljen, ali obavijesti nije moguće poslati: ${notificationError instanceof Error ? notificationError.message : 'nepoznata greška'}`
        };
      }
    }
    return { message: 'Proizvod je spremljen.' };
  }
};
