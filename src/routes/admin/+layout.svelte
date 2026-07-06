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
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/rezervacije', label: 'Rezervacije', icon: '📅' },
    { href: '/admin/vozila', label: 'Vozila', icon: '🚐' },
    { href: '/admin/proizvodi', label: 'Proizvodi', icon: '📦' },
    { href: '/admin/narudzbe', label: 'Narudžbe', icon: '🛒' },
    { href: '/admin/objave', label: 'Objave', icon: '📝' },
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
            <span>{item.icon}</span>
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
