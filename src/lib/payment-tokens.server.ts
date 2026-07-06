import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '$lib/supabase.server';

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSecondPaymentToken(input: {
  bookingId: string;
  expiresAt: string;
  createdBy: string;
}) {
  const token = randomBytes(32).toString('base64url');
  const { error: revokeError } = await supabaseAdmin
    .from('booking_payment_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('booking_id', input.bookingId)
    .is('revoked_at', null);
  if (revokeError) throw new Error(revokeError.message);

  const { error } = await supabaseAdmin.from('booking_payment_tokens').insert({
    booking_id: input.bookingId,
    token_hash: tokenHash(token),
    expires_at: input.expiresAt,
    created_by: input.createdBy
  });
  if (error) throw new Error(error.message);
  return token;
}

export async function revokeSecondPaymentTokens(bookingId: string) {
  const { error } = await supabaseAdmin
    .from('booking_payment_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('booking_id', bookingId)
    .is('revoked_at', null);
  if (error) throw new Error(error.message);
}

export async function validateSecondPaymentToken(bookingId: string, token: string) {
  if (!token || token.length < 32) return false;
  const { data } = await supabaseAdmin
    .from('booking_payment_tokens')
    .select('token_hash')
    .eq('booking_id', bookingId)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString());

  const received = Buffer.from(tokenHash(token));
  return (data ?? []).some((row) => {
    const expected = Buffer.from(row.token_hash);
    return expected.length === received.length && timingSafeEqual(expected, received);
  });
}
