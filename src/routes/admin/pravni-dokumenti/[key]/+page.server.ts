import { error, fail } from '@sveltejs/kit';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { getAdminLegalDocument, requireLegalDocumentKey } from '$lib/legal-documents.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

function documentKey(value: string) {
  try {
    return requireLegalDocumentKey(value);
  } catch {
    throw error(404, 'Pravni dokument ne postoji.');
  }
}

function field(form: FormData, key: string) {
  return String(form.get(key) ?? '').trim();
}

function uuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export const load: PageServerLoad = async ({ params }) => ({
  document: await getAdminLegalDocument(documentKey(params.key))
});

export const actions: Actions = {
  saveDraft: async ({ request, locals, params }) => {
    const administrator = await requireAdministrator(locals);
    const key = documentKey(params.key);
    const form = await request.formData();
    const input = {
      versionLabel: field(form, 'version_label'),
      effectiveDate: field(form, 'effective_date'),
      titleHr: field(form, 'title_hr'),
      titleEn: field(form, 'title_en'),
      summaryHr: field(form, 'summary_hr'),
      summaryEn: field(form, 'summary_en'),
      contentHr: field(form, 'content_hr'),
      contentEn: field(form, 'content_en')
    };

    if (input.versionLabel.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(input.effectiveDate)) {
      return fail(400, { message: 'Unesite oznaku verzije i valjani datum početka primjene.' });
    }
    if (input.titleHr.length < 3 || input.titleEn.length < 3 || input.contentHr.length < 50 || input.contentEn.length < 50) {
      return fail(400, { message: 'Oba naslova i potpuni HR/EN tekst su obavezni.' });
    }

    const previous = await getAdminLegalDocument(key);
    const { data, error: rpcError } = await supabaseAdmin.rpc('save_legal_document_draft', {
      p_document_key: key,
      p_version_label: input.versionLabel,
      p_effective_date: input.effectiveDate,
      p_title_hr: input.titleHr,
      p_title_en: input.titleEn,
      p_summary_hr: input.summaryHr,
      p_summary_en: input.summaryEn,
      p_content_hr: input.contentHr,
      p_content_en: input.contentEn,
      p_actor: administrator.user.id
    });
    if (rpcError || !data) return fail(400, { message: rpcError?.message ?? 'Nacrt nije spremljen. Je li migracija 0038 primijenjena?' });

    await recordAdminEvent({
      administrator,
      entityType: 'legal_document',
      entityId: key,
      action: 'legal_document_draft_created',
      beforeState: { draft_id: previous.draft?.id, published_id: previous.published.id },
      afterState: { version_id: data.id, version_number: data.version_number, version_label: data.version_label }
    });
    return { message: `Nacrt v${data.version_number} je spremljen. Javni tekst još nije promijenjen.` };
  },

  publish: async ({ request, locals, params }) => {
    const administrator = await requireAdministrator(locals);
    const key = documentKey(params.key);
    const form = await request.formData();
    const versionId = field(form, 'version_id');
    if (!uuid(versionId)) return fail(400, { message: 'Nacrt za objavu nije valjan.' });

    const previous = await getAdminLegalDocument(key);
    if (previous.draft?.id !== versionId) return fail(409, { message: 'Odabrani nacrt više nije trenutačan. Osvježite stranicu.' });
    const { data, error: rpcError } = await supabaseAdmin.rpc('publish_legal_document_version', {
      p_version_id: versionId,
      p_actor: administrator.user.id
    });
    if (rpcError || !data) return fail(400, { message: rpcError?.message ?? 'Verzija nije objavljena.' });

    await recordAdminEvent({
      administrator,
      entityType: 'legal_document',
      entityId: key,
      action: 'legal_document_version_published',
      beforeState: { version_id: previous.published.id, version_number: previous.published.version_number },
      afterState: { version_id: data.id, version_number: data.version_number, effective_date: data.effective_date }
    });
    return { message: `Verzija v${data.version_number} je objavljena. Potvrdite HR i EN prikaz na javnoj stranici.` };
  },

  restore: async ({ request, locals, params }) => {
    const administrator = await requireAdministrator(locals);
    const key = documentKey(params.key);
    const form = await request.formData();
    const versionId = field(form, 'version_id');
    if (!uuid(versionId)) return fail(400, { message: 'Verzija za vraćanje nije valjana.' });

    const before = await getAdminLegalDocument(key);
    const source = before.versions.find((version) => version.id === versionId);
    if (!source) return fail(404, { message: 'Odabrana verzija ne postoji u ovom dokumentu.' });
    const { data, error: rpcError } = await supabaseAdmin.rpc('restore_legal_document_version', {
      p_version_id: versionId,
      p_actor: administrator.user.id
    });
    if (rpcError || !data) return fail(400, { message: rpcError?.message ?? 'Verzija nije vraćena.' });

    await recordAdminEvent({
      administrator,
      entityType: 'legal_document',
      entityId: key,
      action: 'legal_document_version_restored_as_draft',
      beforeState: { draft_id: before.draft?.id },
      afterState: { source_version_id: source.id, new_draft_id: data.id, version_number: data.version_number }
    });
    return { message: `Verzija v${source.version_number} kopirana je u novi nacrt v${data.version_number}. Javni tekst nije promijenjen.` };
  }
};
