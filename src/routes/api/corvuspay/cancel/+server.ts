import { redirect } from '@sveltejs/kit';
import { parseCorvuspayOrderNumber } from '$lib/corvuspay.server';
import type { RequestHandler } from './$types';

const handleCancel: RequestHandler = async ({ request, url }) => {
  let orderNumber = String(url.searchParams.get('order_number') ?? '');
  if (request.method === 'POST') {
    const value = (await request.formData()).get('order_number');
    if (typeof value === 'string') orderNumber = value;
  }

  const reference = parseCorvuspayOrderNumber(orderNumber);
  throw redirect(303, reference?.kind === 'order' ? '/checkout/success?payment=cancel' : '/rezerviraj/success?payment=cancel');
};

export const GET = handleCancel;
export const POST = handleCancel;
