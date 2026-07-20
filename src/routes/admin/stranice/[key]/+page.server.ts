import { error, fail } from '@sveltejs/kit';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { getSitePage } from '$lib/site-pages.server';
import { isSitePageKey, sanitizeSitePageContent, SITE_PAGE_DEFINITIONS } from '$lib/site-page-content';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  if (!isSitePageKey(params.key)) throw error(404, 'Stranica nije pronađena.');
  return { page: await getSitePage(params.key) };
};

export const actions: Actions = {
  save: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    if (!isSitePageKey(params.key)) return fail(404, { message: 'Stranica nije pronađena.' });
    const form = await request.formData();
    const raw = String(form.get('content_json') ?? '');
    if (!raw || raw.length > 500_000) return fail(400, { message: 'Sadržaj je prazan ili prevelik.' });

    let submitted: unknown;
    try {
      submitted = JSON.parse(raw);
    } catch {
      return fail(400, { message: 'Sadržaj stranice nije ispravan.' });
    }
    const content = sanitizeSitePageContent(params.key, submitted);
    const definition = SITE_PAGE_DEFINITIONS[params.key];
    const { data: before } = await supabaseAdmin.from('site_pages').select('*').eq('key', params.key).maybeSingle();
    const { data: after, error: saveError } = await supabaseAdmin
      .from('site_pages')
      .upsert({
        key: params.key,
        label: definition.label,
        route: definition.route,
        content,
        is_published: true,
        updated_at: new Date().toISOString(),
        updated_by: administrator.user.id
      })
      .select()
      .single();
    if (saveError) return fail(400, { message: saveError.message });

    await recordAdminEvent({
      administrator,
      entityType: 'site_page',
      entityId: params.key,
      action: 'site_page_updated',
      beforeState: before,
      afterState: after,
      metadata: { section_order: content.sections.map((section) => section.id) }
    });
    return { message: 'Stranica je spremljena i javno objavljena.' };
  }
};
