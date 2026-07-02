<script lang="ts">
  import type { Post } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const post: Post = $derived(data.post as Post);
  const related = $derived(data.relatedPosts.map((item) => ({
    slug: item.slug,
    title: item.title_hr,
    img: item.cover_image,
    date: item.published_at
      ? new Intl.DateTimeFormat('hr-HR').format(new Date(item.published_at))
      : ''
  })));

  const title = $derived($locale === 'hr' ? post.title_hr : (post.title_en || post.title_hr));
  const content = $derived($locale === 'hr' ? post.content_hr : (post.content_en || post.content_hr));
</script>

<svelte:head><title>{title || 'Novost'} — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x max-w-3xl mx-auto">
    {#if post}
      <nav class="flex items-center gap-2 text-xs mb-6 text-[#9aa0a8] uppercase flex-wrap">
        <a href="/" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Početna stranica' : 'Home'}</a><span>/</span>
        <a href="/novosti" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Novosti' : 'News'}</a><span>/</span>
        <span class="text-[#2b2b2b]">{title}</span>
      </nav>

      <h1 class="text-[28px] md:text-[36px] font-bold text-[#2b2b2b] mb-4 leading-tight">{title}</h1>

      {#if post.published_at}
        <p class="text-[12px] text-[#9aa0a8] uppercase tracking-wide mb-8">{new Date(post.published_at).toLocaleDateString($locale === 'hr' ? 'hr-HR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      {/if}

      {#if post.cover_image}
        <div class="rounded-xl overflow-hidden mb-10" style="box-shadow:0 4px 24px rgba(0,0,0,0.10)">
          <img src={post.cover_image} alt={title} class="w-full h-auto" />
        </div>
      {/if}

      <div class="text-[15px] leading-[1.8] text-[#5b6168] space-y-4">
        {#each (content || '').split('\n').filter(Boolean) as para}
          <p>{para}</p>
        {/each}
      </div>

      <div class="mt-10 pt-8 border-t border-[#ededf0]">
        <a href="/novosti" class="inline-flex items-center gap-2 text-sm font-bold" style="color:#b5890a">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {$locale === 'hr' ? 'Sve novosti' : 'All news'}
        </a>
      </div>
    {/if}
  </div>

  <!-- Related -->
  <div class="container-x mt-14">
    <h2 class="text-[20px] font-bold text-[#2b2b2b] mb-6">{$locale === 'hr' ? 'Povezane objave' : 'Related posts'}</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each related as r}
        <a href="/novosti/{r.slug}" class="card group overflow-hidden">
          <div class="aspect-video overflow-hidden bg-[#f3f4f6]">
            <img src={r.img} alt="" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div class="p-5">
            <p class="text-[12px] text-[#9aa0a8] mb-1">{r.date}</p>
            <h3 class="font-semibold text-[15px] text-[#2b2b2b] leading-snug group-hover:text-[#b5890a] transition-colors">{r.title}</h3>
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>
