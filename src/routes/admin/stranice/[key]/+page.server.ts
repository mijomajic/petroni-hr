import { error, fail } from '@sveltejs/kit';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { getDraftSitePage, getSitePage, getSitePageVersions } from '$lib/site-pages.server';
import { isSitePageKey, sanitizeSitePageContent, SITE_PAGE_DEFINITIONS } from '$lib/site-page-content';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  if (!isSitePageKey(params.key)) throw error(404, 'Stranica nije pronađena.');
  const [page, versions, draft] = await Promise.all([getSitePage(params.key), getSitePageVersions(params.key), getDraftSitePage(params.key)]);
  return { page, versions, draft };
};

export const actions: Actions = {
  saveDraft: async ({ request, params, locals }) => {
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
    const { data: previousDraft } = await supabaseAdmin
      .from('site_page_versions')
      .select('*')
      .eq('page_key', params.key)
      .eq('status', 'draft')
      .maybeSingle();
    const { data: latest } = await supabaseAdmin
      .from('site_page_versions')
      .select('version_number')
      .eq('page_key', params.key)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (previousDraft) await supabaseAdmin.from('site_page_versions').update({ status: 'archived' }).eq('id', previousDraft.id);
    const { data: after, error: saveError } = await supabaseAdmin
      .from('site_page_versions')
      .insert({ page_key: params.key, version_number: Number(latest?.version_number ?? 0) + 1, status: 'draft', content, created_by: administrator.user.id })
      .select()
      .single();
    if (saveError) return fail(400, { message: saveError.message });

    await recordAdminEvent({
      administrator,
      entityType: 'site_page',
      entityId: params.key,
      action: 'site_page_updated',
      beforeState: previousDraft,
      afterState: after,
      metadata: { section_order: content.sections.map((section) => section.id) }
    });
    return { message: 'Skica je spremljena. Javna stranica nije promijenjena.' };
  },

  publishDraft: async ({ params, locals }) => {
    const administrator = await requireAdministrator(locals);
    if (!isSitePageKey(params.key)) return fail(404, { message: 'Stranica nije pronađena.' });
    const { data: draft } = await supabaseAdmin.from('site_page_versions').select('*').eq('page_key', params.key).eq('status', 'draft').maybeSingle();
    if (!draft) return fail(400, { message: 'Prvo spremite skicu koju želite objaviti.' });
    const { data: published } = await supabaseAdmin.from('site_page_versions').select('*').eq('page_key', params.key).eq('status', 'published').maybeSingle();
    if (published) await supabaseAdmin.from('site_page_versions').update({ status: 'archived' }).eq('id', published.id);
    const { error: publishError } = await supabaseAdmin.from('site_page_versions').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', draft.id);
    if (publishError) return fail(400, { message: publishError.message });
    const definition = SITE_PAGE_DEFINITIONS[params.key];
    const { data: after, error: pageError } = await supabaseAdmin.from('site_pages').upsert({ key: params.key, label: definition.label, route: definition.route, content: draft.content, is_published: true, updated_at: new Date().toISOString(), updated_by: administrator.user.id }).select().single();
    if (pageError) return fail(400, { message: pageError.message });
    await recordAdminEvent({ administrator, entityType: 'site_page', entityId: params.key, action: 'site_page_published', beforeState: published, afterState: after, metadata: { version_id: draft.id } });
    return { message: 'Skica je objavljena na javnoj stranici.' };
  },

  restoreVersion: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    if (!isSitePageKey(params.key)) return fail(404, { message: 'Stranica nije pronađena.' });
    const form = await request.formData();
    const versionId = String(form.get('version_id') ?? '');
    const { data: source } = await supabaseAdmin.from('site_page_versions').select('*').eq('id', versionId).eq('page_key', params.key).single();
    if (!source) return fail(404, { message: 'Verzija nije pronađena.' });
    const { data: previousDraft } = await supabaseAdmin.from('site_page_versions').select('*').eq('page_key', params.key).eq('status', 'draft').maybeSingle();
    if (previousDraft) await supabaseAdmin.from('site_page_versions').update({ status: 'archived' }).eq('id', previousDraft.id);
    const { data: latest } = await supabaseAdmin.from('site_page_versions').select('version_number').eq('page_key', params.key).order('version_number', { ascending: false }).limit(1).maybeSingle();
    const { data: restored, error: restoreError } = await supabaseAdmin.from('site_page_versions').insert({ page_key: params.key, version_number: Number(latest?.version_number ?? 0) + 1, status: 'draft', content: source.content, created_by: administrator.user.id, restored_from_id: source.id }).select().single();
    if (restoreError) return fail(400, { message: restoreError.message });
    await recordAdminEvent({ administrator, entityType: 'site_page', entityId: params.key, action: 'site_page_version_restored_to_draft', beforeState: source, afterState: restored });
    return { message: 'Odabrana verzija je vraćena kao skica. Pregledajte je prije objave.' };
  }
};
