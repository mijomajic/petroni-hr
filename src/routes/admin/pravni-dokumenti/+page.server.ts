import { getAllAdminLegalDocuments } from '$lib/legal-documents.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
  documents: await getAllAdminLegalDocuments()
});
