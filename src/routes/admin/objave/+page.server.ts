import { fail } from '@sveltejs/kit';
import { checkboxField, optionalTextField, slugField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { data, error } = await supabaseAdmin.from('posts').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { posts: data ?? [] };
};

function postPayload(form: FormData) {
  const title = textField(form, 'title_hr');
  if (!title) throw new Error('Objava mora imati naslov.');
  return {
    title_hr: title,
    title_en: optionalTextField(form, 'title_en'),
    slug: slugField(form, 'slug', title),
    excerpt_hr: optionalTextField(form, 'excerpt_hr'),
    content_hr: optionalTextField(form, 'content_hr'),
    content_en: optionalTextField(form, 'content_en'),
    cover_image: optionalTextField(form, 'cover_image'),
    is_published: checkboxField(form, 'is_published'),
    published_at: checkboxField(form, 'is_published') ? new Date().toISOString() : null
  };
}

export const actions: Actions = {
  savePost: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = optionalTextField(form, 'id');
    let payload: ReturnType<typeof postPayload>;
    try {
      payload = postPayload(form);
    } catch (error) {
      return fail(400, { message: error instanceof Error ? error.message : 'Objava nije spremljena.' });
    }

    if (id) {
      const { data: before } = await supabaseAdmin.from('posts').select('*').eq('id', id).single();
      const patch = before?.is_published && payload.is_published ? { ...payload, published_at: before.published_at } : payload;
      const { data: after, error } = await supabaseAdmin.from('posts').update(patch).eq('id', id).select().single();
      if (error) return fail(400, { message: error.message });
      await recordAdminEvent({ administrator, entityType: 'post', entityId: id, action: 'post_updated', beforeState: before, afterState: after });
      return { message: 'Objava je spremljena.' };
    }

    const { data, error } = await supabaseAdmin.from('posts').insert(payload).select().single();
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'post', entityId: data.id, action: 'post_created', afterState: data });
    return { message: 'Objava je dodana.' };
  },

  deletePost: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = textField(form, 'id');
    const { data: before } = await supabaseAdmin.from('posts').select('*').eq('id', id).single();
    if (!before) return fail(404, { message: 'Objava nije pronađena.' });
    const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'post', entityId: id, action: 'post_deleted', beforeState: before });
    return { message: 'Objava je obrisana.' };
  }
};
