import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { data: post, error: postError } = await locals.supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

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
