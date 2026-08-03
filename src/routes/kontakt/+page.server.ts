import { getSitePageForRequest } from '$lib/site-page-preview.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => ({
  pageContent: await getSitePageForRequest('contact', url, locals)
});
