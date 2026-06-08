<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Post } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';

  let posts: Post[] = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const { data } = await supabase.from('posts').select('*').eq('is_published', true).order('published_at', { ascending: false });
    posts = data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Novosti — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="mb-16">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">Blog</span>
      <h1 class="text-5xl font-black uppercase tracking-tight text-white">NOVOSTI</h1>
    </div>

    {#if loading}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each [1,2,3] as _}<div class="rounded-2xl aspect-[4/3] animate-pulse" style="background: #1a1a1a"></div>{/each}
      </div>
    {:else if posts.length === 0}
      <div class="text-center py-20" style="color: #9ca3af">
        <p>Nema objavljenih novosti.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each posts as post}
          <a href="/novosti/{post.slug}" class="group block rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.02]" style="background: #111; border: 1px solid #1a1a1a">
            <div class="aspect-video overflow-hidden">
              {#if post.cover_image}
                <img src={post.cover_image} alt={$locale === 'hr' ? post.title_hr : (post.title_en || post.title_hr)} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {:else}
                <div class="w-full h-full" style="background: #1a1a1a"></div>
              {/if}
            </div>
            <div class="p-6">
              <p class="text-xs mb-3" style="color: #9ca3af">{post.published_at ? new Date(post.published_at).toLocaleDateString('hr-HR') : ''}</p>
              <h3 class="font-bold text-white text-lg leading-tight mb-2">
                {$locale === 'hr' ? post.title_hr : (post.title_en || post.title_hr)}
              </h3>
              <p class="text-sm line-clamp-2" style="color: #9ca3af">
                {$locale === 'hr' ? (post.excerpt_hr || '') : (post.excerpt_en || post.excerpt_hr || '')}
              </p>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
