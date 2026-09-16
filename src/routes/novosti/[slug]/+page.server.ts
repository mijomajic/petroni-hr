import { error } from '@sveltejs/kit';
import { getAdministrator } from '$lib/admin.server';
import type { PageServerLoad } from './$types';
import { DEMO_POSTS } from '$lib/demo-data';
import { useStaticDemoData } from '$lib/demo-mode.server';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  if (useStaticDemoData) {
    const post = DEMO_POSTS.find((item) => item.slug === params.slug);
    if (!post) error(404, 'Objava nije pronađena.');
    return {
      post,
      relatedPosts: DEMO_POSTS.filter((item) => item.id !== post.id).slice(0, 3)
    };
  }

  const preview = url.searchParams.get('preview') === 'draft';
  if (preview && !(await getAdministrator(locals))) error(404, 'Objava nije pronađena.');
  let query = locals.supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug);
  if (!preview) query = query.eq('is_published', true);
  const { data: post, error: postError } = await query.single();

  if (postError || !post) error(404, 'Objava nije pronađena.');

  const { data: relatedPosts } = await locals.supabase
    .from('posts')
    .select('slug,title_hr,cover_image,published_at')
    .eq('is_published', true)
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(3);

  return { post, relatedPosts: relatedPosts ?? [] };
};
