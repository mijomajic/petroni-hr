import { getPublishedLegalDocument } from '$lib/legal-documents.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
  document: await getPublishedLegalDocument('shop_terms')
});
