<script lang="ts">
  import { page } from '$app/stores';
  import { cart } from '$lib/stores/cart';
  import { locale } from '$lib/stores/locale';
  import CartDrawer from '$lib/components/ui/CartDrawer.svelte';
  import { BUSINESS } from '$lib/config/business';

  let mobileOpen = $state(false);
  let cartOpen = $state(false);

  const cartCount = $derived($cart.reduce((acc, i) => acc + i.qty, 0));
  const accountHref = $derived($page.data.user ? '/moj-racun' : '/prijava');

  const navCopy = {
    hr: {
      home: 'Naslovnica', vehicles: 'Flota', rental: 'Najam kampera', sale: 'Vozila za prodaju',
      film: 'Vozila za filmske produkcije', shop: 'Oprema', news: 'Putni vodiči', about: 'O nama',
      contact: 'Kontakt', book: 'Rezerviraj'
    },
    en: {
      home: 'Home', vehicles: 'Fleet', rental: 'Camper hire', sale: 'Vehicles for Sale',
      film: 'Film Production Vehicles', shop: 'Gear', news: 'Travel journal', about: 'About us',
      contact: 'Contact', book: 'Book Now'
    }
  } as const;

  function navLabel(key: keyof typeof navCopy.hr) {
    return navCopy[$locale][key];
  }

  const navLinks = [
    { href: '/', label: () => navLabel('home') },
    { href: '/vozila/najam-kampera', label: () => navLabel('vehicles') },
    { href: '/shop', label: () => navLabel('shop') },
    { href: '/novosti', label: () => navLabel('news') },
    { href: '/o-nama', label: () => navLabel('about') },
    { href: '/kontakt', label: () => navLabel('contact') },
  ];

  function isActive(href: string): boolean {
    const path = $page.url.pathname;
    if (href === '/') return path === '/';
    return path === href || path.startsWith(href + '/');
  }
</script>

<header class="sticky top-0 left-0 right-0 z-50 bg-[#fbfaf7]/95 border-b border-[#e7e1d8] shadow-[0_1px_18px_rgba(31,58,50,0.07)] backdrop-blur-md">
  <div class="container-x flex items-center justify-between gap-3 h-[72px]">
    <!-- Logo -->
    <a href="/" class="flex-shrink-0" aria-label={BUSINESS.name}>
      <img
        src={BUSINESS.logo}
        alt={BUSINESS.name}
        width="220"
        height="58"
        class="h-10 w-auto"
      />
    </a>

    <!-- Desktop nav -->
    <nav class="hidden lg:flex items-center gap-1">
      {#each navLinks as link}
        <a
          href={link.href}
          class="flex items-center gap-1 rounded px-3.5 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors duration-200"
          style={isActive(link.href)
            ? 'background:#ad6036;color:#ffffff'
            : 'color:#35443e'}
          class:hover:text-[#9f542e]={!isActive(link.href)}
        >
          {link.label()}
        </a>
      {/each}
    </nav>

    <!-- Right actions -->
    <div class="flex items-center gap-2 md:gap-3">
      <!-- Book CTA -->
      <div class="hidden lg:block">
        <a href="/rezerviraj" class="btn btn-primary px-5 py-2.5 text-[12px]">
          {navLabel('book')}
        </a>
      </div>

      <!-- Cart -->
      <button onclick={() => cartOpen = true} class="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 hover:bg-[#f3f4f6]" aria-label={$locale === 'hr' ? 'Košarica' : 'Cart'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        {#if cartCount > 0}
          <span class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style="background:#c87442">{cartCount}</span>
        {/if}
      </button>

      <!-- Account -->
      <a href={accountHref} class="hidden sm:flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 hover:bg-[#f3f4f6]" aria-label={$page.data.user ? ($locale === 'hr' ? 'Moj račun' : 'My account') : ($locale === 'hr' ? 'Prijava' : 'Sign in')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </a>

      <!-- Search -->
      <a href="/shop" class="hidden sm:flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 hover:bg-[#f3f4f6]" aria-label={$locale === 'hr' ? 'Pretraga' : 'Search'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </a>

      <!-- Mobile hamburger -->
      <button type="button" onclick={() => mobileOpen = !mobileOpen} class="lg:hidden flex flex-col gap-[5px] w-10 h-10 items-center justify-center flex-shrink-0" aria-label={$locale === 'hr' ? 'Izbornik' : 'Menu'}>
        <span class="block w-5 h-0.5 bg-[#2b2b2b] transition-all duration-300" class:rotate-45={mobileOpen} class:translate-y-[7px]={mobileOpen}></span>
        <span class="block w-5 h-0.5 bg-[#2b2b2b] transition-all duration-300" class:opacity-0={mobileOpen}></span>
        <span class="block w-5 h-0.5 bg-[#2b2b2b] transition-all duration-300" class:-rotate-45={mobileOpen} class:-translate-y-[7px]={mobileOpen}></span>
      </button>
    </div>
  </div>
</header>

<!-- Mobile menu -->
{#if mobileOpen}
  <div class="fixed inset-0 z-40 bg-white flex flex-col pt-24 pb-10 px-6 lg:hidden overflow-y-auto">
    <nav class="flex flex-col">
      {#each navLinks as link}
        <a href={link.href} onclick={() => mobileOpen = false}
           class="text-lg font-semibold uppercase tracking-wide py-4 border-b border-[#eceef1]"
           style="color:{isActive(link.href) ? '#9f542e' : '#2b2b2b'}">
          {link.label()}
        </a>
      {/each}
    </nav>

    <div class="mt-8 grid grid-cols-1 gap-3">
      <a href="/rezerviraj" onclick={() => mobileOpen = false} class="btn btn-primary w-full py-4">{navLabel('book')}</a>
      <a href={accountHref} onclick={() => mobileOpen = false} class="btn btn-ghost w-full">
        {$page.data.user ? ($locale === 'hr' ? 'Moj račun' : 'My account') : ($locale === 'hr' ? 'Prijava / Registracija' : 'Sign in / Create account')}
      </a>
      <a href="/shop" onclick={() => mobileOpen = false} class="btn btn-ghost w-full">
        {$locale === 'hr' ? 'Pretraži shop' : 'Search shop'}
      </a>
    </div>

  </div>
{/if}

<CartDrawer bind:open={cartOpen} />
