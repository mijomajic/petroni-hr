<script lang="ts">
  import { page } from '$app/stores';
  import { cart } from '$lib/stores/cart';
  import { locale, toggleLocale } from '$lib/stores/locale';
  import { _ } from 'svelte-i18n';
  import CartDrawer from '$lib/components/ui/CartDrawer.svelte';

  let mobileOpen = $state(false);
  let cartOpen = $state(false);
  let scrolled = $state(false);

  const cartCount = $derived($cart.reduce((acc, i) => acc + i.qty, 0));

  $effect(() => {
    const handler = () => { scrolled = window.scrollY > 50; };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  });

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
</script>

<header class="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 md:px-6">
  <nav
    class="w-full max-w-7xl rounded-full border transition-all duration-700"
    style="background: {scrolled ? 'rgba(0,0,0,0.7)' : 'transparent'}; backdrop-filter: {scrolled ? 'blur(20px)' : 'none'}; border-color: {scrolled ? 'rgba(42,42,42,0.8)' : 'transparent'}"
  >
    <div class="flex items-center justify-between px-4 py-3 md:px-6">
      <!-- Logo -->
      <a href="/" class="flex-shrink-0">
        <img
          src="https://www.petroni.hr/wp-content/uploads/2024/03/Logo-Petroni-Yellow-New.png"
          alt="Petroni"
          class="h-8 md:h-10 w-auto"
        />
      </a>

      <!-- Desktop nav -->
      <ul class="hidden lg:flex items-center gap-1">
        {#each navLinks as link}
          <li class="relative group">
            <a
              href={link.href}
              class="px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-300 rounded-full hover:bg-white/10"
              class:text-accent={$page.url.pathname === link.href || $page.url.pathname.startsWith(link.href + '/')}
              class:text-white={!($page.url.pathname === link.href || $page.url.pathname.startsWith(link.href + '/'))}
              style="color: {($page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href + '/') && link.href !== '/')) ? '#F5C518' : 'white'}"
            >
              {link.label()}
            </a>
            {#if link.children}
              <div class="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div class="bg-[#111] border border-[#2a2a2a] rounded-2xl p-2 min-w-[220px] shadow-xl">
                  {#each link.children as child}
                    <a
                      href={child.href}
                      class="block px-4 py-2 text-sm text-[#9ca3af] hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-200"
                    >
                      {child.label()}
                    </a>
                  {/each}
                </div>
              </div>
            {/if}
          </li>
        {/each}
      </ul>

      <!-- Right actions -->
      <div class="flex items-center gap-2">
        <!-- Language toggle -->
        <button
          onclick={toggleLocale}
          class="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 border border-[#2a2a2a] hover:border-[#F5C518] text-[#9ca3af] hover:text-white"
        >
          {$locale === 'hr' ? 'EN' : 'HR'}
        </button>

        <!-- Cart -->
        <button
          onclick={() => cartOpen = true}
          class="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-white/10"
          aria-label="Cart"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-white">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {#if cartCount > 0}
            <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-black" style="background: #F5C518">
              {cartCount}
            </span>
          {/if}
        </button>

        <!-- Book CTA -->
        <a
          href="/rezerviraj"
          class="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest text-black transition-all duration-500 active:scale-95"
          style="background: #F5C518"
        >
          {$_('nav.book')}
          <span class="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </a>

        <!-- Mobile hamburger -->
        <button
          onclick={() => mobileOpen = !mobileOpen}
          class="lg:hidden flex flex-col gap-1.5 w-10 h-10 items-center justify-center"
          aria-label="Menu"
        >
          <span class="block w-5 h-0.5 bg-white transition-all duration-300" class:rotate-45={mobileOpen} class:translate-y-2={mobileOpen}></span>
          <span class="block w-5 h-0.5 bg-white transition-all duration-300" class:opacity-0={mobileOpen}></span>
          <span class="block w-5 h-0.5 bg-white transition-all duration-300" class:-rotate-45={mobileOpen} class:-translate-y-2={mobileOpen}></span>
        </button>
      </div>
    </div>
  </nav>
</header>

<!-- Mobile menu overlay -->
{#if mobileOpen}
  <div
    class="fixed inset-0 z-40 backdrop-blur-2xl flex flex-col pt-24 pb-10 px-6"
    style="background: rgba(10,10,10,0.95)"
    onclick={() => mobileOpen = false}
  >
    <nav class="flex flex-col gap-2">
      {#each navLinks as link, i}
        <a
          href={link.href}
          onclick={() => mobileOpen = false}
          class="text-3xl font-bold uppercase tracking-widest py-3 border-b transition-all duration-300"
          style="border-color: #2a2a2a; animation-delay: {i * 60}ms; color: {$page.url.pathname === link.href ? '#F5C518' : 'white'}"
        >
          {link.label()}
        </a>
      {/each}
    </nav>

    <div class="mt-auto flex items-center gap-4">
      <button onclick={toggleLocale} class="px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-widest" style="border-color: #2a2a2a; color: #9ca3af">
        {$locale === 'hr' ? 'EN' : 'HR'}
      </button>
      <a
        href="/rezerviraj"
        onclick={() => mobileOpen = false}
        class="flex-1 text-center py-3 rounded-full font-bold uppercase tracking-widest text-black"
        style="background: #F5C518"
      >
        Rezerviraj
      </a>
    </div>
  </div>
{/if}

<!-- Cart drawer -->
<CartDrawer bind:open={cartOpen} />
