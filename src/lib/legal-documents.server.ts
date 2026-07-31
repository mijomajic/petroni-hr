import { supabaseAdmin } from '$lib/supabase.server';
import {
  cloneLegalDocument,
  DEFAULT_LEGAL_DOCUMENTS,
  isLegalDocumentKey,
  LEGAL_DOCUMENT_DEFINITIONS,
  LEGAL_DOCUMENT_KEYS,
  type LegalDocumentKey,
  type LegalDocumentStatus,
  type LegalDocumentVersion
} from '$lib/legal-documents';

type LegalDocumentRow = {
  key: string;
  label: string;
  route: string;
  updated_at: string | null;
  updated_by: string | null;
};

export type LegalDocumentAdminRecord = LegalDocumentRow & {
  key: LegalDocumentKey;
  versions: LegalDocumentVersion[];
  draft: LegalDocumentVersion | null;
  published: LegalDocumentVersion;
  uses_fallback: boolean;
};

function normalizeVersion(row: Record<string, unknown>, key: LegalDocumentKey): LegalDocumentVersion {
  const fallback = DEFAULT_LEGAL_DOCUMENTS[key];
  const rawStatus = String(row.status ?? 'archived');
  const status: LegalDocumentStatus = rawStatus === 'draft' || rawStatus === 'published' ? rawStatus : 'archived';
  return {
    id: typeof row.id === 'string' ? row.id : null,
    document_key: key,
    version_number: Number(row.version_number) || 0,
    version_label: String(row.version_label ?? fallback.version_label),
    status,
    effective_date: String(row.effective_date ?? fallback.effective_date),
    title_hr: String(row.title_hr ?? fallback.title_hr),
    title_en: String(row.title_en ?? fallback.title_en),
    summary_hr: String(row.summary_hr ?? ''),
    summary_en: String(row.summary_en ?? ''),
    content_hr: String(row.content_hr ?? ''),
    content_en: String(row.content_en ?? ''),
    created_at: typeof row.created_at === 'string' ? row.created_at : null,
    created_by: typeof row.created_by === 'string' ? row.created_by : null,
    published_at: typeof row.published_at === 'string' ? row.published_at : null,
    published_by: typeof row.published_by === 'string' ? row.published_by : null,
    restored_from_id: typeof row.restored_from_id === 'string' ? row.restored_from_id : null
  };
}

export async function getPublishedLegalDocument(key: LegalDocumentKey): Promise<LegalDocumentVersion> {
  const { data, error } = await supabaseAdmin
    .from('legal_document_versions')
    .select('*')
    .eq('document_key', key)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) return cloneLegalDocument(DEFAULT_LEGAL_DOCUMENTS[key]);
  return normalizeVersion(data as Record<string, unknown>, key);
}

export async function getAdminLegalDocument(key: LegalDocumentKey): Promise<LegalDocumentAdminRecord> {
  const definition = LEGAL_DOCUMENT_DEFINITIONS[key];
  const [{ data: document }, { data: versionRows, error: versionError }] = await Promise.all([
    supabaseAdmin.from('legal_documents').select('key,label,route,updated_at,updated_by').eq('key', key).maybeSingle(),
    supabaseAdmin.from('legal_document_versions').select('*').eq('document_key', key).order('version_number', { ascending: false })
  ]);

  if (versionError || !versionRows?.length) {
    const published = cloneLegalDocument(DEFAULT_LEGAL_DOCUMENTS[key]);
    return {
      key,
      label: definition.label,
      route: definition.route,
      updated_at: null,
      updated_by: null,
      versions: [published],
      draft: null,
      published,
      uses_fallback: true
    };
  }

  const versions = versionRows.map((row) => normalizeVersion(row as Record<string, unknown>, key));
  const published = versions.find((version) => version.status === 'published')
    ?? cloneLegalDocument(DEFAULT_LEGAL_DOCUMENTS[key]);
  return {
    key,
    label: String((document as LegalDocumentRow | null)?.label ?? definition.label),
    route: String((document as LegalDocumentRow | null)?.route ?? definition.route),
    updated_at: (document as LegalDocumentRow | null)?.updated_at ?? null,
    updated_by: (document as LegalDocumentRow | null)?.updated_by ?? null,
    versions,
    draft: versions.find((version) => version.status === 'draft') ?? null,
    published,
    uses_fallback: published.uses_fallback === true
  };
}

export async function getAllAdminLegalDocuments(): Promise<LegalDocumentAdminRecord[]> {
  return Promise.all(LEGAL_DOCUMENT_KEYS.map(getAdminLegalDocument));
}

export function requireLegalDocumentKey(value: string): LegalDocumentKey {
  if (!isLegalDocumentKey(value)) throw new Error('Nepoznat pravni dokument.');
  return value;
}
