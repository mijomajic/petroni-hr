<script lang="ts">
  import './layout.css';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import { onMount, tick } from 'svelte';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { absoluteUrl, canonicalPath, DEFAULT_IMAGE, SITE_NAME } from '$lib/seo';
  import { locale } from '$lib/stores/locale';
  import ShopNavigationSkeleton from '$lib/components/shop/ShopNavigationSkeleton.svelte';
  import NewsNavigationSkeleton from '$lib/components/content/NewsNavigationSkeleton.svelte';

  let { children } = $props();
  const isAdmin = $derived($page.url.pathname.startsWith('/admin'));
  const canonicalUrl = $derived(absoluteUrl(canonicalPath($page.url.pathname)));
  const hasSearchParams = $derived($page.url.searchParams.toString().length > 0);
  const defaultDescription = 'Petroni nudi najam i prodaju kampera i karavana, kamping opremu, podršku za putovanja i lokacije diljem Hrvatske i Europe.';

  let observer: IntersectionObserver | undefined;
  let navigationTimer: ReturnType<typeof setTimeout> | undefined;
  let showNavigationFeedback = $state(false);
  let showShopSkeleton = $state(false);
  let showNewsSkeleton = $state(false);

  function scanReveals() {
    if (!observer) return;
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => observer!.observe(el));
  }

  onMount(() => {
    document.documentElement.classList.add('js');

    const legacyLocale = new URL(window.location.href).searchParams.get('lang');
    if (legacyLocale === 'en') {
      locale.set('en');
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('lang');
      window.history.replaceState(window.history.state, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
    }

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
  afterNavigate(async ({ from, to }) => {
    clearTimeout(navigationTimer);
    showNavigationFeedback = false;
    showShopSkeleton = false;
    showNewsSkeleton = false;
    await tick();
    if (!from || from.url.pathname !== to?.url.pathname) window.scrollTo(0, 0);
    scanReveals();
  });

  beforeNavigate(({ to, willUnload }) => {
    if (!to?.url || willUnload) return;
    const isShopDestination = to.url.pathname === '/shop' || to.url.pathname.startsWith('/shop/') || to.url.pathname.startsWith('/product/');
    const isNewsDestination = to.url.pathname === '/novosti';
    clearTimeout(navigationTimer);
    navigationTimer = setTimeout(() => {
      showNavigationFeedback = true;
      showShopSkeleton = isShopDestination;
      showNewsSkeleton = isNewsDestination;
    }, 180);
  });
</script>

<svelte:head>
  <link rel="icon" href="/brand/petroni-logo.png" />
  <link rel="apple-touch-icon" href="/brand/petroni-logo.png" />
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
  {#if showNavigationFeedback}<div class="route-progress" aria-hidden="true"></div>{/if}
  {#if showShopSkeleton}<ShopNavigationSkeleton />{/if}
  {#if showNewsSkeleton}<NewsNavigationSkeleton />{/if}
  {#if !isAdmin}<Header />{/if}
  <main class="flex-1">
    {@render children()}
  </main>
  {#if !isAdmin}<Footer />{/if}
</div>

<style>
  .route-progress { position: fixed; z-index: 60; top: 0; left: 0; height: 3px; width: 38%; background: #e2a80a; box-shadow: 0 1px 8px rgba(226,168,10,.38); animation: route-progress 1.2s cubic-bezier(.16,1,.3,1) infinite; }
  @keyframes route-progress { 0% { transform: translateX(-110%); } 100% { transform: translateX(370%); } }
</style>
