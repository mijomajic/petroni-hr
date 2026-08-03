import { error } from '@sveltejs/kit';
import { getAdministrator } from '$lib/admin.server';
import { getDraftSitePage, getPublishedSitePage } from '$lib/site-pages.server';
import type { SitePageKey } from '$lib/site-page-content';

/** Resolves an unpublished page draft only for an authenticated Petroni admin. */
export async function getSitePageForRequest(pageKey: SitePageKey, url: URL, locals: App.Locals) {
  if (url.searchParams.get('preview') !== 'draft') return getPublishedSitePage(pageKey);
  const administrator = await getAdministrator(locals);
  if (!administrator) throw error(404, 'Stranica nije pronađena.');
  return (await getDraftSitePage(pageKey)) ?? getPublishedSitePage(pageKey);
}
