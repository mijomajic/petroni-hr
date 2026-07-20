<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabase';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();

  const isLoginPage = $derived($page.url.pathname === '/admin/login');

  async function logout() {
    await supabase.auth.signOut();
    goto('/admin/login');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'M4 13h6V4H4v9Zm10 7h6V11h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z' },
    { href: '/admin/rezervacije', label: 'Rezervacije', icon: 'M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z' },
    { href: '/admin/vozila', label: 'Vozila', icon: 'M3 16V9l2-4h12l4 6v5M5 16v2m14-2v2M3 13h18M7 15h.01M17 15h.01' },
    { href: '/admin/sezone', label: 'Sezone i cijene', icon: 'M4 5h16M4 12h16M4 19h16M8 3v4m8-4v4M8 10v4m8-4v4M8 17v4m8-4v4' },
    { href: '/admin/naknade', label: 'Naknade', icon: 'M12 3v18M17 7H9.5a3.5 3.5 0 0 0 0 7H15a3 3 0 0 1 0 6H6' },
    { href: '/admin/dodatne-opcije', label: 'Dodatne opcije', icon: 'M12 5v14M5 12h14M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z' },
    { href: '/admin/proizvodi', label: 'Proizvodi', icon: 'm4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10' },
    { href: '/admin/obavijesti', label: 'Obavijesti zalihe', icon: 'M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4' },
    { href: '/admin/narudzbe', label: 'Narudžbe', icon: 'M3 4h2l2 11h10l3-8H6m2 12h.01M17 19h.01' },
    { href: '/admin/objave', label: 'Objave', icon: 'M5 4h14v16H5V4Zm3 4h8m-8 4h8m-8 4h5' },
    { href: '/admin/stranice', label: 'Javne stranice', icon: 'M4 4h16v16H4V4Zm4 4h8M8 12h8m-8 4h5' },
    { href: '/admin/uvjeti-najma', label: 'Uvjeti najma', icon: 'M6 3h9l3 3v15H6V3Zm9 0v4h4M9 11h6m-6 4h6m-6 4h4' },
    { href: '/admin/postavke', label: 'Postavke', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .34 1.88l.04.05a2 2 0 1 1-2.83 2.83l-.05-.04A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.05A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.05.04a2 2 0 1 1-2.83-2.83l.04-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.05A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.04-.05a2 2 0 1 1 2.83-2.83l.05.04A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.05A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.05-.04a2 2 0 1 1 2.83 2.83l-.04.05A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.05A1.7 1.7 0 0 0 19.4 15Z' },
  ];
</script>

{#if isLoginPage}
  {@render children()}
{:else if data.administrator}
  <div class="min-h-screen flex" style="background:#fafbfc">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 fixed left-0 top-0 bottom-0 flex flex-col bg-white border-r border-[#eceef1]">
      <div class="p-6 mb-2 border-b border-[#eceef1]">
        <img src="https://www.petroni.hr/wp-content/uploads/2024/03/Logo-Petroni-Yellow-New.png" alt="Petroni" class="h-8 w-auto" />
        <p class="text-xs mt-2 text-[#8b9099]">Admin Panel</p>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 space-y-1 py-2">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-[#f6f7f9]"
            style="{$page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href + '/') && item.href !== '/admin') ? 'background:#fff7e0;color:#b5890a' : 'color:#5b6168'}"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d={item.icon} />
            </svg>
            {item.label}
          </a>
        {/each}
      </nav>

      <div class="p-4 border-t border-[#eceef1]">
        <p class="text-xs truncate mb-3 text-[#8b9099]">{data.administrator.email}</p>
        <a href="/promijeni-lozinku?context=admin" class="mb-2 block w-full rounded-md border border-[#e2e4e8] py-2 text-center text-xs font-bold uppercase tracking-wide text-[#5b6168] hover:bg-[#f6f7f9]">Promijeni lozinku</a>
        <button onclick={logout} class="w-full py-2 rounded-md text-xs font-bold uppercase tracking-wide text-[#5b6168] border border-[#e2e4e8] hover:bg-[#f6f7f9]">Odjava</button>
        <a href="/" class="block mt-2 text-center text-xs text-[#8b9099] hover:text-[#2b2b2b]">← Na stranicu</a>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 ml-64 p-8 text-[#2b2b2b]">
      {@render children()}
    </main>
  </div>
{/if}
