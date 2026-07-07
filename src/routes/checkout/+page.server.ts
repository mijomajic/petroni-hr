import { corvuspayAvailable } from '$lib/payments.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
  corvuspayAvailable: corvuspayAvailable()
});
