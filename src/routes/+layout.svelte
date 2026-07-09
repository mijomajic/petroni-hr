<script lang="ts">
  import './layout.css';
  import { setupI18n } from '$lib/i18n';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { absoluteUrl, canonicalPath, DEFAULT_IMAGE, SITE_NAME } from '$lib/seo';

  let { children } = $props();
  const isAdmin = $derived($page.url.pathname.startsWith('/admin'));
  const canonicalUrl = $derived(absoluteUrl(canonicalPath($page.url.pathname)));
  const hasSearchParams = $derived($page.url.searchParams.toString().length > 0);
  const defaultDescription = 'Petroni nudi najam i prodaju kampera i karavana, kamping opremu, podršku za putovanja i lokacije diljem Hrvatske i Europe.';

  // Initialise i18n synchronously — messages are bundled, so no need to gate
  // rendering behind a loading screen (that was the main cause of slow loads).
  setupI18n();

  let observer: IntersectionObserver | undefined;

  function scanReveals() {
    if (!observer) return;
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => observer!.observe(el));
  }

  onMount(() => {
    document.documentElement.classList.add('js');

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer!.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    scanReveals();

    // Safety net: if anything is still hidden after load, reveal it.
    const fallback = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('visible');
      });
    }, 1200);

    return () => {
      observer?.disconnect();
      clearTimeout(fallback);
    };
  });

  // Re-scan on client-side navigation so new pages animate too.
  afterNavigate(async () => {
    await tick();
    window.scrollTo(0, 0);
    scanReveals();
  });
</script>

<svelte:head>
  <link rel="icon" href="https://www.petroni.hr/wp-content/uploads/2024/03/cropped-Group-3-270x270.jpg" />
  <link rel="apple-touch-icon" href="https://www.petroni.hr/wp-content/uploads/2024/03/cropped-Group-3-270x270.jpg" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="canonical" href={canonicalUrl} />
  <meta name="theme-color" content="#ffffff" />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={DEFAULT_IMAGE} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Petroni — Najam i prodaja kampera i karavana" />
  <meta name="twitter:description" content={defaultDescription} />
  <meta name="twitter:image" content={DEFAULT_IMAGE} />
  {#if isAdmin}
    <meta name="robots" content="noindex, nofollow" />
  {:else if hasSearchParams}
    <meta name="robots" content="noindex, follow" />
  {/if}
</svelte:head>

<div class="min-h-screen flex flex-col">
  {#if !isAdmin}<Header />{/if}
  <main class="flex-1">
    {@render children()}
  </main>
  {#if !isAdmin}<Footer />{/if}
</div>
