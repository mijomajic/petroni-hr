<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Post } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';

  let post: Post | null = $state(null);
  let loading = $state(true);

  const title = $derived(post ? ($locale === 'hr' ? post.title_hr : (post.title_en || post.title_hr)) : '');
  const content = $derived(post ? ($locale === 'hr' ? post.content_hr : (post.content_en || post.content_hr)) : '');

  onMount(async () => {
    const { data } = await supabase.from('posts').select('*').eq('slug', $page.params.slug).eq('is_published', true).single();
    post = data;
    loading = false;
  });
</script>

<svelte:head><title>{title || 'Novost'} — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-3xl mx-auto px-4 md:px-6">
    {#if loading}
      <div class="h-96 flex items-center justify-center"><div class="w-8 h-8 rounded-full border-2 animate-spin" style="border-color: #F5C518; border-top-color: transparent"></div></div>
    {:else if post}
      <nav class="flex items-center gap-2 text-xs mb-8" style="color: #9ca3af">
        <a href="/" class="hover:text-white">Naslovnica</a><span>/</span>
        <a href="/novosti" class="hover:text-white">Novosti</a><span>/</span>
        <span class="text-white">{title}</span>
      </nav>

      {#if post.cover_image}
        <div class="rounded-[2rem] overflow-hidden aspect-video mb-10" style="border: 1px solid #2a2a2a">
          <img src={post.cover_image} alt={title} class="w-full h-full object-cover" />
        </div>
      {/if}

      <p class="text-xs mb-4" style="color: #9ca3af">{post.published_at ? new Date(post.published_at).toLocaleDateString('hr-HR') : ''}</p>
      <h1 class="text-4xl font-black uppercase tracking-tight text-white mb-8">{title}</h1>
      <div class="prose prose-invert max-w-none text-sm leading-relaxed" style="color: #9ca3af">
        {#if content}
          {@html content.replace(/\n/g, '<br/>')}
        {/if}
      </div>

      <div class="mt-12 pt-8" style="border-top: 1px solid #1a1a1a">
        <a href="/novosti" class="inline-flex items-center gap-2 text-sm font-bold transition-colors" style="color: #F5C518">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Sve novosti
        </a>
      </div>
    {:else}
      <div class="text-center py-20" style="color: #9ca3af">
        <p>Objava nije pronađena.</p>
      </div>
    {/if}
  </div>
</div>
