import { fail } from '@sveltejs/kit';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { data, error } = await supabaseAdmin
    .from('rental_terms')
    .select('id,version,content_hr,content_en,is_active,created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return {
    activeTerms: (data ?? []).find((terms) => terms.is_active) ?? null,
    versions: data ?? []
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const version = String(form.get('version') ?? '').trim();
    const contentHr = String(form.get('content_hr') ?? '').trim();
    const contentEn = String(form.get('content_en') ?? '').trim();

    if (version.length < 3) {
      return fail(400, { message: 'Unesite oznaku verzije od najmanje 3 znaka.' });
    }
    if (contentHr.length < 50) {
      return fail(400, { message: 'Tekst uvjeta mora imati najmanje 50 znakova.' });
    }

    const { data: previous } = await supabaseAdmin
      .from('rental_terms')
      .select('id,version')
      .eq('is_active', true)
      .maybeSingle();
    const { data, error } = await supabaseAdmin.rpc('replace_active_rental_terms', {
      p_version: version,
      p_content_hr: contentHr,
      p_content_en: contentEn || null
    });
    if (error || !data) {
      return fail(400, {
        message: error?.message.includes('duplicate')
          ? 'Ta oznaka verzije već postoji. Unesite novu oznaku.'
          : (error?.message ?? 'Uvjeti nisu spremljeni.')
      });
    }

    await recordAdminEvent({
      administrator,
      entityType: 'rental_terms',
      entityId: data.id,
      action: 'rental_terms_version_activated',
      beforeState: previous,
      afterState: { id: data.id, version: data.version }
    });
    return { message: `Verzija ${data.version} je spremljena i aktivirana.` };
  }
};
