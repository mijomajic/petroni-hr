import { supabaseAdmin } from '$lib/supabase.server';
import {
  cloneSitePageContent,
  DEFAULT_SITE_PAGES,
  sanitizeSitePageContent,
  SITE_PAGE_DEFINITIONS,
  type SitePageContent,
  type SitePageKey
} from '$lib/site-page-content';

export type SitePageRecord = {
  key: SitePageKey;
  label: string;
  route: string;
  content: SitePageContent;
  is_published: boolean;
  updated_at: string | null;
  updated_by: string | null;
  uses_fallback: boolean;
};

export async function getSitePage(pageKey: SitePageKey): Promise<SitePageRecord> {
  const definition = SITE_PAGE_DEFINITIONS[pageKey];
  const { data, error } = await supabaseAdmin
    .from('site_pages')
    .select('key,label,route,content,is_published,updated_at,updated_by')
    .eq('key', pageKey)
    .maybeSingle();

  if (error || !data) {
    return {
      key: pageKey,
      label: definition.label,
      route: definition.route,
      content: cloneSitePageContent(DEFAULT_SITE_PAGES[pageKey]),
      is_published: true,
      updated_at: null,
      updated_by: null,
      uses_fallback: true
    };
  }

  const hasStoredContent = data.content
    && typeof data.content === 'object'
    && !Array.isArray(data.content)
    && Object.keys(data.content as Record<string, unknown>).length > 0;

  return {
    key: pageKey,
    label: String(data.label || definition.label),
    route: String(data.route || definition.route),
    content: sanitizeSitePageContent(pageKey, data.content),
    is_published: data.is_published !== false,
    updated_at: data.updated_at ?? null,
    updated_by: data.updated_by ?? null,
    uses_fallback: !hasStoredContent
  };
}

export async function getPublishedSitePage(pageKey: SitePageKey): Promise<SitePageContent> {
  const page = await getSitePage(pageKey);
  return page.is_published
    ? page.content
    : cloneSitePageContent(DEFAULT_SITE_PAGES[pageKey]);
}

/** Used only after the caller has confirmed the current visitor is an admin. */
export async function getDraftSitePage(pageKey: SitePageKey): Promise<SitePageContent | null> {
  const { data, error } = await supabaseAdmin
    .from('site_page_versions')
    .select('content')
    .eq('page_key', pageKey)
    .eq('status', 'draft')
    .maybeSingle();
  if (error || !data) return null;
  return sanitizeSitePageContent(pageKey, data.content);
}

export async function getSitePageVersions(pageKey: SitePageKey) {
  const { data, error } = await supabaseAdmin
    .from('site_page_versions')
    .select('id,version_number,status,created_at,published_at,restored_from_id')
    .eq('page_key', pageKey)
    .order('version_number', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllSitePages(): Promise<SitePageRecord[]> {
  return Promise.all((Object.keys(SITE_PAGE_DEFINITIONS) as SitePageKey[]).map(getSitePage));
}
