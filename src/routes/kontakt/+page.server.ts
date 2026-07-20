import { getPublishedSitePage } from '$lib/site-pages.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
  pageContent: await getPublishedSitePage('contact')
});
