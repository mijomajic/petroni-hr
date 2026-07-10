<script lang="ts">
  import type { Post } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const posts: Post[] = $derived(data.posts as Post[]);
</script>

<svelte:head>
  <title>Novosti, savjeti i ideje za kampiranje | Petroni</title>
  <meta name="description" content="Petroni novosti, savjeti i informacije iz svijeta kampiranja, kampera, karavana, putovanja i kamping opreme." />
  <meta property="og:title" content="Novosti, savjeti i ideje za kampiranje | Petroni" />
  <meta property="og:description" content="Petroni novosti, savjeti i informacije iz svijeta kampiranja, kampera, karavana, putovanja i kamping opreme." />
</svelte:head>

<div class="section">
  <div class="container-x">
    <div class="text-center mb-12">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Aktualno iz svijeta kampiranja' : 'News from the world of camping'}</span>
      <h1 class="section-title">{$locale === 'hr' ? 'Novosti' : 'News'}</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {#each posts as post}
        <div class="card flex flex-col overflow-hidden">
          <div class="px-5 pt-5">
            <h3 class="font-semibold text-[16px] leading-snug text-[#2b2b2b] mb-3 min-h-[3em]">
              {$locale === 'hr' ? post.title_hr : (post.title_en || post.title_hr)}
            </h3>
          </div>
          <a href="/novosti/{post.slug}" class="block aspect-video overflow-hidden bg-[#f3f4f6] group">
            {#if post.cover_image}
              <img src={post.cover_image} alt="" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            {/if}
          </a>
          <div class="px-5 py-5 mt-auto">
            <a href="/novosti/{post.slug}" class="btn btn-primary">{$locale === 'hr' ? 'Vidi više' : 'Read more'}</a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
