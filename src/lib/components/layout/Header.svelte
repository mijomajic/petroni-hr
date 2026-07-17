<script lang="ts">
  import { page } from '$app/stores';
  import { cart } from '$lib/stores/cart';
  import { locale } from '$lib/stores/locale';
  import { _ } from 'svelte-i18n';
  import CartDrawer from '$lib/components/ui/CartDrawer.svelte';

  let mobileOpen = $state(false);
  let cartOpen = $state(false);
  let vozilaOpen = $state(false);

  const cartCount = $derived($cart.reduce((acc, i) => acc + i.qty, 0));
  const accountHref = $derived($page.data.user ? '/moj-racun' : '/prijava');

  const navLinks = [
    { href: '/', label: () => $_('nav.home') },
    {
      href: '/vozila', label: () => $_('nav.vehicles'), children: [
        { href: '/vozila/najam-kampera', label: () => $_('nav.rental') },
        { href: '/vozila/vozila-za-prodaju', label: () => $_('nav.sale') },
        { href: '/vozila/vozila-za-filmske-produkcije', label: () => $_('nav.film') },
      ]
    },
    { href: '/shop', label: () => $_('nav.shop') },
    { href: '/novosti', label: () => $_('nav.news') },
    { href: '/o-nama', label: () => $_('nav.about') },
    { href: '/kontakt', label: () => $_('nav.contact') },
  ];

  function isActive(href: string): boolean {
    const path = $page.url.pathname;
    if (href === '/') return path === '/';
    return path === href || path.startsWith(href + '/');
  }
</script>

<header class="sticky top-0 left-0 right-0 z-50 bg-white border-b border-[#eceef1] shadow-[0_1px_12px_rgba(16,24,40,0.05)]">
  <div class="container-x flex items-center justify-between gap-3 h-[72px]">
    <!-- Logo -->
    <a href="/" class="flex-shrink-0" aria-label="Petroni">
      <img
        src="https://www.petroni.hr/wp-content/uploads/2024/03/Logo-Petroni-Yellow-New.png"
        alt="Petroni"
        width="220"
        height="58"
        class="h-9 w-auto"
        onerror={(e) => { const el = e.currentTarget as HTMLImageElement; el.replaceWith(Object.assign(document.createElement('span'), { textContent: 'PETRONI', className: 'text-2xl font-extrabold tracking-tight', style: 'color:#f5c518' })); }}
      />
    </a>

    <!-- Desktop nav -->
    <nav class="hidden lg:flex items-center gap-1">
      {#each navLinks as link}
        <div class="relative" role="none"
             onmouseenter={() => { if (link.children) vozilaOpen = true; }}
             onmouseleave={() => { if (link.children) vozilaOpen = false; }}
             onfocusin={() => { if (link.children) vozilaOpen = true; }}
             onfocusout={(event) => {
               if (link.children && !(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
                 vozilaOpen = false;
               }
             }}>
          <a
            href={link.href}
            class="flex items-center gap-1 px-3.5 py-2 text-[13px] font-semibold uppercase tracking-wide rounded transition-colors duration-200"
            style="{isActive(link.href)
              ? 'background:#f5c518;color:#2b2b2b'
              : 'color:#3a3f45'}"
            class:hover:text-[#b5890a]={!isActive(link.href)}
            aria-haspopup={link.children ? 'true' : undefined}
            aria-expanded={link.children ? vozilaOpen : undefined}
          >
            {link.label()}
            {#if link.children}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
            {/if}
          </a>

          {#if link.children}
            <div class="absolute top-full left-0 pt-2 transition-all duration-200 {vozilaOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'}">
              <div class="bg-white rounded-lg border border-[#eceef1] shadow-xl py-2 min-w-[240px]">
                {#each link.children as child}
                  <a
                    href={child.href}
                    class="block px-5 py-3 text-[13px] font-bold uppercase tracking-wide transition-colors duration-150 hover:bg-[#faf6e6] hover:text-[#b5890a] focus-visible:bg-[#faf6e6] focus-visible:text-[#b5890a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f5c518]"
                    style="color:{isActive(child.href) ? '#b5890a' : '#3a3f45'}"
                  >
                    {child.label()}
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </nav>

    <!-- Right actions -->
    <div class="flex items-center gap-2 md:gap-3">
      <!-- Language flags -->
      <div class="hidden sm:flex items-center gap-1.5">
        <button onclick={() => locale.set('hr')} aria-label="Hrvatski"
          class="w-6 h-[18px] rounded-sm overflow-hidden transition-all duration-200"
          style="opacity:{$locale === 'hr' ? '1' : '0.4'}; outline:{$locale === 'hr' ? '2px solid #f5c518' : 'none'}; outline-offset:1px">
          <img src="https://flagcdn.com/h40/hr.png" alt="" width="30" height="20" class="w-full h-full object-cover" />
        </button>
        <button onclick={() => locale.set('en')} aria-label="English"
          class="w-6 h-[18px] rounded-sm overflow-hidden transition-all duration-200"
          style="opacity:{$locale === 'en' ? '1' : '0.4'}; outline:{$locale === 'en' ? '2px solid #f5c518' : 'none'}; outline-offset:1px">
          <img src="https://flagcdn.com/h40/gb.png" alt="" width="30" height="20" class="w-full h-full object-cover" />
        </button>
      </div>

      <!-- Book CTA -->
      <div class="hidden lg:block">
        <a href="/rezerviraj" class="btn btn-primary px-5 py-2.5 text-[12px]">
          {$_('nav.book')}
        </a>
      </div>

      <!-- Cart -->
      <button onclick={() => cartOpen = true} class="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 hover:bg-[#f3f4f6]" aria-label="Košarica">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        {#if cartCount > 0}
          <span class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style="background:#f5c518">{cartCount}</span>
        {/if}
      </button>

      <!-- Account -->
      <a href={accountHref} class="hidden sm:flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 hover:bg-[#f3f4f6]" aria-label={$page.data.user ? 'Moj račun' : 'Prijava'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </a>

      <!-- Search -->
      <a href="/shop" class="hidden sm:flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 hover:bg-[#f3f4f6]" aria-label="Pretraga">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </a>

      <!-- Mobile hamburger -->
      <button type="button" onclick={() => mobileOpen = !mobileOpen} class="lg:hidden flex flex-col gap-[5px] w-10 h-10 items-center justify-center flex-shrink-0" aria-label="Izbornik">
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
           style="color:{isActive(link.href) ? '#b5890a' : '#2b2b2b'}">
          {link.label()}
        </a>
        {#if link.children}
          {#each link.children as child}
            <a href={child.href} onclick={() => mobileOpen = false}
               class="text-sm font-semibold uppercase tracking-wide py-3 pl-4 border-b border-[#f3f4f6]" style="color:#6b7178">
              — {child.label()}
            </a>
          {/each}
        {/if}
      {/each}
    </nav>

    <div class="mt-8 grid grid-cols-1 gap-3">
      <a href="/rezerviraj" onclick={() => mobileOpen = false} class="btn btn-primary w-full py-4">{$_('nav.book')}</a>
      <a href={accountHref} onclick={() => mobileOpen = false} class="btn btn-ghost w-full">
        {$page.data.user ? 'Moj račun' : 'Prijava / Registracija'}
      </a>
      <a href="/shop" onclick={() => mobileOpen = false} class="btn btn-ghost w-full">
        {$locale === 'hr' ? 'Pretraži shop' : 'Search shop'}
      </a>
    </div>

    <div class="mt-6 flex items-center justify-center gap-3">
      <div class="flex items-center gap-2">
        <button onclick={() => locale.set('hr')} aria-label="Hrvatski" class="w-7 h-5 rounded-sm overflow-hidden" style="opacity:{$locale === 'hr' ? '1' : '0.4'}">
          <img src="https://flagcdn.com/h40/hr.png" alt="" width="30" height="20" class="w-full h-full object-cover" />
        </button>
        <button onclick={() => locale.set('en')} aria-label="English" class="w-7 h-5 rounded-sm overflow-hidden" style="opacity:{$locale === 'en' ? '1' : '0.4'}">
          <img src="https://flagcdn.com/h40/gb.png" alt="" width="30" height="20" class="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  </div>
{/if}

<CartDrawer bind:open={cartOpen} />
