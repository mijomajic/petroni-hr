import { fail } from '@sveltejs/kit';
import { checkboxField, optionalTextField, slugField, textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

type PostSnapshot = Record<string, unknown>;

function snapshot(post: Record<string, unknown>): PostSnapshot {
  return {
    title_hr: post.title_hr,
    title_en: post.title_en,
    slug: post.slug,
    excerpt_hr: post.excerpt_hr,
    content_hr: post.content_hr,
    content_en: post.content_en,
    cover_image: post.cover_image,
    is_published: post.is_published,
    published_at: post.published_at
  };
}

async function saveVersion(post: Record<string, unknown>, administratorId: string, restoredFromId?: string) {
  const { data: latest, error: latestError } = await supabaseAdmin
    .from('post_versions')
    .select('version_number')
    .eq('post_id', post.id as string)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) throw new Error(latestError.message);
  const { error } = await supabaseAdmin.from('post_versions').insert({
    post_id: post.id,
    version_number: Number(latest?.version_number ?? 0) + 1,
    status: post.is_published ? 'published' : 'draft',
    content: snapshot(post),
    created_by: administratorId,
    ...(restoredFromId ? { restored_from_id: restoredFromId } : {})
  });
  if (error) throw new Error(error.message);
}

export const load: PageServerLoad = async () => {
  const [postsResult, versionsResult] = await Promise.all([
    supabaseAdmin.from('posts').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('post_versions').select('id,post_id,version_number,status,created_at,restored_from_id').order('version_number', { ascending: false })
  ]);
  if (postsResult.error) throw new Error(postsResult.error.message);
  if (versionsResult.error) throw new Error(versionsResult.error.message);
  const versionsByPost = new Map<string, typeof versionsResult.data>();
  for (const version of versionsResult.data ?? []) {
    const existing = versionsByPost.get(version.post_id) ?? [];
    existing.push(version);
    versionsByPost.set(version.post_id, existing);
  }
  return { posts: (postsResult.data ?? []).map((post) => ({ ...post, versions: versionsByPost.get(post.id) ?? [] })) };
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
      await saveVersion(after, administrator.user.id);
      await recordAdminEvent({ administrator, entityType: 'post', entityId: id, action: 'post_updated', beforeState: before, afterState: after });
      return { message: 'Objava je spremljena.' };
    }

    const { data, error } = await supabaseAdmin.from('posts').insert(payload).select().single();
    if (error) return fail(400, { message: error.message });
    await saveVersion(data, administrator.user.id);
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
  },

  restorePostVersion: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const versionId = textField(form, 'version_id');
    const { data: version } = await supabaseAdmin.from('post_versions').select('*').eq('id', versionId).single();
    if (!version) return fail(404, { message: 'Verzija objave nije pronađena.' });
    const content = version.content as PostSnapshot;
    const patch = {
      title_hr: String(content.title_hr ?? ''),
      title_en: content.title_en ? String(content.title_en) : null,
      slug: String(content.slug ?? ''),
      excerpt_hr: content.excerpt_hr ? String(content.excerpt_hr) : null,
      content_hr: content.content_hr ? String(content.content_hr) : null,
      content_en: content.content_en ? String(content.content_en) : null,
      cover_image: content.cover_image ? String(content.cover_image) : null,
      is_published: false,
      published_at: null
    };
    if (!patch.title_hr || !patch.slug) return fail(400, { message: 'Odabrana verzija nema valjan naslov ili slug.' });
    const { data: before } = await supabaseAdmin.from('posts').select('*').eq('id', version.post_id).single();
    const { data: after, error } = await supabaseAdmin.from('posts').update(patch).eq('id', version.post_id).select().single();
    if (error) return fail(400, { message: error.message });
    await saveVersion(after, administrator.user.id, version.id);
    await recordAdminEvent({ administrator, entityType: 'post', entityId: version.post_id, action: 'post_version_restored_to_draft', beforeState: before, afterState: after, metadata: { version_id: version.id } });
    return { message: 'Verzija je vraćena kao skica. Pregledajte je prije objave.' };
  }
};
