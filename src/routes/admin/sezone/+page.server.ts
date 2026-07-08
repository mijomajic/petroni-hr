import { fail } from '@sveltejs/kit';
import { integerField, numberField, optionalTextField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [seasons, vehicles, prices] = await Promise.all([
    supabaseAdmin.from('seasons').select('*').order('date_from', { ascending: true }),
    supabaseAdmin
      .from('vehicles')
      .select('id,name,category,sort_order')
      .eq('type', 'rental')
      .order('sort_order', { ascending: true }),
    supabaseAdmin.from('season_prices').select('*')
  ]);
  if (seasons.error) throw new Error(seasons.error.message);
  if (vehicles.error) throw new Error(vehicles.error.message);
  if (prices.error) throw new Error(prices.error.message);

  return {
    seasons: seasons.data ?? [],
    vehicles: vehicles.data ?? [],
    prices: prices.data ?? []
  };
};

export const actions: Actions = {
  saveSeason: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = optionalTextField(form, 'id');
    const name = textField(form, 'name');
    const dateFrom = textField(form, 'date_from');
    const dateTo = textField(form, 'date_to');
    if (!name || !dateFrom || !dateTo || dateTo < dateFrom) {
      return fail(400, { message: 'Unesite naziv i ispravan raspon sezone.' });
    }
    const payload = {
      name,
      date_from: dateFrom,
      date_to: dateTo,
      min_nights: integerField(form, 'min_nights') ?? 1,
      sort_order: integerField(form, 'sort_order') ?? 0
    };

    if (id) {
      const { data: before } = await supabaseAdmin.from('seasons').select('*').eq('id', id).single();
      const { data: after, error } = await supabaseAdmin.from('seasons').update(payload).eq('id', id).select().single();
      if (error) return fail(400, { message: error.message });
      await recordAdminEvent({ administrator, entityType: 'season', entityId: id, action: 'season_updated', beforeState: before, afterState: after });
      return { message: 'Sezona je spremljena.' };
    }

    const { data, error } = await supabaseAdmin.from('seasons').insert(payload).select().single();
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'season', entityId: data.id, action: 'season_created', afterState: data });
    return { message: 'Sezona je dodana.' };
  },

  deleteSeason: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = textField(form, 'id');
    const { data: before } = await supabaseAdmin.from('seasons').select('*').eq('id', id).single();
    if (!before) return fail(404, { message: 'Sezona nije pronađena.' });
    const { error } = await supabaseAdmin.from('seasons').delete().eq('id', id);
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'season', entityId: id, action: 'season_deleted', beforeState: before });
    return { message: 'Sezona i povezane cijene su obrisane.' };
  },

  savePrices: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const rows: Array<{ season_id: string; vehicle_id: string; price_per_day: number }> = [];
    for (const [key] of form.entries()) {
      if (!key.startsWith('price:')) continue;
      const [, seasonId, vehicleId] = key.split(':');
      const price = numberField(form, key);
      if (!seasonId || !vehicleId || price === null) continue;
      rows.push({ season_id: seasonId, vehicle_id: vehicleId, price_per_day: price });
    }
    if (rows.length === 0) return fail(400, { message: 'Nema cijena za spremanje.' });
    const { error } = await supabaseAdmin
      .from('season_prices')
      .upsert(rows, { onConflict: 'season_id,vehicle_id' });
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({
      administrator,
      entityType: 'season_prices',
      entityId: 'bulk',
      action: 'season_prices_updated',
      metadata: { rows: rows.length }
    });
    return { message: `Spremljeno je ${rows.length} cijena.` };
  }
};
