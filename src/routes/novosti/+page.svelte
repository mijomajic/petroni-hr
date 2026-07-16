<script lang="ts">
  import type { Post } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const posts: Post[] = $derived(data.posts as Post[]);
  const featured = $derived(posts[0]);
  const remaining = $derived(posts.slice(1));

  function postTitle(post: Post) {
    return $locale === 'hr' ? post.title_hr : (post.title_en || post.title_hr);
  }

  function postExcerpt(post: Post) {
    return post.excerpt_hr || ($locale === 'hr'
      ? 'Pročitajte najnovije informacije, savjete i priče iz Petronija.'
      : 'Read the latest information, advice and stories from Petroni.');
  }

  function postDate(value: string | null) {
    if (!value) return '';
    return new Intl.DateTimeFormat($locale === 'hr' ? 'hr-HR' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date(value));
  }
</script>

<svelte:head>
  <title>Novosti, savjeti i ideje za kampiranje | Petroni</title>
  <meta name="description" content="Petroni novosti, savjeti i informacije iz svijeta kampiranja, kampera, karavana, putovanja i kamping opreme." />
  <meta property="og:title" content="Novosti, savjeti i ideje za kampiranje | Petroni" />
  <meta property="og:description" content="Petroni novosti, savjeti i informacije iz svijeta kampiranja, kampera, karavana, putovanja i kamping opreme." />
</svelte:head>

<main class="section bg-[#fbfbfa]">
  <div class="container-x">
    <header class="mb-10 max-w-2xl md:mb-14">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Priče, vodiči i novosti' : 'Stories, guides and news'}</span>
      <h1 class="section-title text-wrap-balance">{$locale === 'hr' ? 'Iz svijeta kampiranja' : 'From the world of camping'}</h1>
      <p class="mt-4 max-w-xl text-[15px] leading-7 text-[#747980]">{$locale === 'hr' ? 'Praktični savjeti, novosti iz Petronija i ideje za sigurnije, opuštenije putovanje.' : 'Practical advice, news from Petroni and ideas for safer, more relaxed travel.'}</p>
    </header>

    {#if featured}
      <a href="/novosti/{featured.slug}" class="group mb-12 grid overflow-hidden rounded-2xl bg-[#252525] text-white md:grid-cols-[1.35fr_1fr] md:items-stretch">
        <div class="aspect-[16/10] overflow-hidden bg-[#343434] md:aspect-auto md:min-h-[410px]">
          {#if featured.cover_image}
            <img src={featured.cover_image} alt={postTitle(featured)} class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
          {/if}
        </div>
        <div class="flex flex-col justify-end p-7 md:p-10">
          {#if postDate(featured.published_at)}<p class="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f5c518]">{postDate(featured.published_at)}</p>{/if}
          <h2 class="text-wrap-balance text-2xl font-bold leading-tight text-white md:text-3xl">{postTitle(featured)}</h2>
          <p class="mt-4 line-clamp-3 text-sm leading-6 text-white/65">{postExcerpt(featured)}</p>
          <span class="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#f5c518]">{$locale === 'hr' ? 'Pročitaj članak' : 'Read article'} <span aria-hidden="true">→</span></span>
        </div>
      </a>
    {/if}

    {#if remaining.length}
      <section aria-labelledby="latest-news-title">
        <div class="mb-6 flex items-end justify-between border-b border-[#dedfdf] pb-4">
          <h2 id="latest-news-title" class="text-xl font-bold text-[#2b2b2b]">{$locale === 'hr' ? 'Najnovije objave' : 'Latest posts'}</h2>
          <span class="text-xs text-[#8b9099]">{remaining.length} {$locale === 'hr' ? 'objave' : 'posts'}</span>
        </div>
        <div class="grid gap-x-8 gap-y-10 md:grid-cols-2">
          {#each remaining as post}
            <article class="group grid grid-cols-[128px_minmax(0,1fr)] gap-5 sm:grid-cols-[190px_minmax(0,1fr)]">
              <a href="/novosti/{post.slug}" class="aspect-[4/3] overflow-hidden rounded-xl bg-[#eceeed]">
                {#if post.cover_image}<img src={post.cover_image} alt={postTitle(post)} loading="lazy" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />{/if}
              </a>
              <div class="min-w-0 py-1">
                {#if postDate(post.published_at)}<p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#a17d00]">{postDate(post.published_at)}</p>{/if}
                <h3 class="text-wrap-pretty text-base font-semibold leading-snug text-[#2b2b2b] sm:text-lg"><a href="/novosti/{post.slug}" class="transition-colors hover:text-[#9a7600]">{postTitle(post)}</a></h3>
                <p class="mt-2 line-clamp-2 text-xs leading-5 text-[#777c82] sm:text-sm">{postExcerpt(post)}</p>
              </div>
            </article>
          {/each}
        </div>
      </section>
    {/if}
  </div>
</main>
