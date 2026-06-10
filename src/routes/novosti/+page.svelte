<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Post } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';

  const seed: Post[] = [
    { id: '1', slug: 'camping-center-petroni-alde-servis', title_hr: 'Camping Center Petroni postao ovlašteni servis za Alde grijanje u Hrvatskoj', title_en: 'Camping Center Petroni — authorised Alde service in Croatia', content_hr: '', content_en: '', excerpt_hr: '', excerpt_en: '', cover_image: 'https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg', published_at: '2025-03-10', is_published: true, created_at: '' },
    { id: '2', slug: 'klima-uredaj-plein-aircon-12v', title_hr: 'Klima uređaj PLEIN-Aircon 12V', title_en: 'PLEIN-Aircon 12V air conditioner', content_hr: '', content_en: '', excerpt_hr: '', excerpt_en: '', cover_image: 'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg', published_at: '2025-02-22', is_published: true, created_at: '' },
    { id: '3', slug: 'katalog-remo-2024', title_hr: 'Katalog REMO 2024', title_en: 'REMO 2024 catalogue', content_hr: '', content_en: '', excerpt_hr: '', excerpt_en: '', cover_image: 'https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp', published_at: '2024-12-01', is_published: true, created_at: '' },
    { id: '4', slug: 'camper-trolley', title_hr: 'Camper Trolley za jednostavno manevriranje sa prikolicama', title_en: 'Camper Trolley for easy trailer manoeuvring', content_hr: '', content_en: '', excerpt_hr: '', excerpt_en: '', cover_image: 'https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg', published_at: '2024-10-15', is_published: true, created_at: '' },
    { id: '5', slug: 'priprema-kamp-prikolice-za-zimu', title_hr: 'Priprema kamp prikolice za "zimski san"', title_en: 'Preparing your caravan for winter', content_hr: '', content_en: '', excerpt_hr: '', excerpt_en: '', cover_image: 'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg', published_at: '2024-10-01', is_published: true, created_at: '' },
    { id: '6', slug: 'priprema-kampera-za-zimu', title_hr: 'Priprema kampera za zimu', title_en: 'Preparing your camper for winter', content_hr: '', content_en: '', excerpt_hr: '', excerpt_en: '', cover_image: 'https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp', published_at: '2024-09-20', is_published: true, created_at: '' },
  ];

  let posts: Post[] = $state(seed);

  onMount(() => {
    supabase.from('posts').select('*').eq('is_published', true).order('published_at', { ascending: false })
      .then(({ data }) => { if (data?.length) posts = data; });
  });
</script>

<svelte:head><title>Novosti — Petroni</title></svelte:head>

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
