import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '$lib/supabase.server';

export type Administrator = {
  user: User;
  email: string;
  role: 'admin';
};

export async function getAdministrator(
  locals: App.Locals
): Promise<Administrator | null> {
  const { user } = await locals.safeGetSession();
  if (!user) return null;

  const { data, error: queryError } = await supabaseAdmin
    .from('admin_users')
    .select('email,role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (queryError || !data || data.role !== 'admin') return null;
  return { user, email: data.email, role: 'admin' };
}

export async function requireAdministrator(
  locals: App.Locals
): Promise<Administrator> {
  const { user } = await locals.safeGetSession();
  if (!user) throw error(401, 'Potrebna je prijava.');

  const administrator = await getAdministrator(locals);
  if (!administrator) throw error(403, 'Nemate administratorske ovlasti.');
  return administrator;
}

export async function guardAdminPage(event: Pick<RequestEvent, 'locals' | 'url'>) {
  const { user } = await event.locals.safeGetSession();
  if (!user) {
    throw redirect(303, `/admin/login?next=${encodeURIComponent(event.url.pathname)}`);
  }
  const administrator = await getAdministrator(event.locals);
  if (!administrator) throw error(403, 'Nemate administratorske ovlasti.');
  return administrator;
}

export async function recordAdminEvent(input: {
  administrator: Administrator;
  entityType: string;
  entityId: string;
  action: string;
  beforeState?: unknown;
  afterState?: unknown;
  metadata?: Record<string, unknown>;
}) {
  const { error: insertError } = await supabaseAdmin.from('admin_events').insert({
    actor_user_id: input.administrator.user.id,
    actor_email: input.administrator.email,
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    before_state: input.beforeState ?? null,
    after_state: input.afterState ?? null,
    metadata: input.metadata ?? {}
  });
  if (insertError) throw new Error(`Audit zapis nije spremljen: ${insertError.message}`);
}
