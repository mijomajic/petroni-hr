import { redirect } from '@sveltejs/kit';
import { parseCorvuspayOrderNumber } from '$lib/corvuspay.server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const reference = parseCorvuspayOrderNumber(String(url.searchParams.get('order_number') ?? ''));
  throw redirect(303, reference?.kind === 'order' ? '/checkout/success?payment=cancel' : '/rezerviraj/success?payment=cancel');
};
