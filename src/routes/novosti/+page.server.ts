import type { PageServerLoad } from './$types';
import { DEMO_POSTS } from '$lib/demo-data';
import { useStaticDemoData } from '$lib/demo-mode.server';

export const load: PageServerLoad = async ({ locals }) => {
  if (useStaticDemoData) return { posts: DEMO_POSTS, loadError: null };

  const { data, error } = await locals.supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  return { posts: data ?? [], loadError: error?.message ?? null };
};
