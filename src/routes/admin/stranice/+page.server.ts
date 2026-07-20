import { getAllSitePages } from '$lib/site-pages.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
  pages: await getAllSitePages()
});
