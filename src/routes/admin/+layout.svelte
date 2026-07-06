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
    { href: '/admin/proizvodi', label: 'Proizvodi', icon: 'm4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10' },
    { href: '/admin/narudzbe', label: 'Narudžbe', icon: 'M3 4h2l2 11h10l3-8H6m2 12h.01M17 19h.01' },
    { href: '/admin/objave', label: 'Objave', icon: 'M5 4h14v16H5V4Zm3 4h8m-8 4h8m-8 4h5' },
    { href: '/admin/uvjeti-najma', label: 'Uvjeti najma', icon: 'M6 3h9l3 3v15H6V3Zm9 0v4h4M9 11h6m-6 4h6m-6 4h4' },
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

      <nav class="flex-1 px-3 space-y-1 py-2">
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
