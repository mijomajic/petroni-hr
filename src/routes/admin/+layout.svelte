<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabase';

  let { children } = $props();
  let user = $state<any>(null);
  let checking = $state(true);

  const isLoginPage = $derived($page.url.pathname === '/admin/login');

  onMount(async () => {
    if (isLoginPage) { checking = false; return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      goto('/admin/login');
    } else {
      user = session.user;
    }
    checking = false;
  });

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
{:else if checking}
  <div class="min-h-screen flex items-center justify-center" style="background: #0a0a0a">
    <div class="w-8 h-8 rounded-full border-2 animate-spin" style="border-color: #F5C518; border-top-color: transparent"></div>
  </div>
{:else if user}
  <div class="min-h-screen flex" style="background: #0a0a0a">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 fixed left-0 top-0 bottom-0 flex flex-col" style="background: #080808; border-right: 1px solid #1a1a1a">
      <div class="p-6 mb-4" style="border-bottom: 1px solid #1a1a1a">
        <img src="https://www.petroni.hr/wp-content/uploads/2024/03/Logo-Petroni-Yellow-New.png" alt="Petroni" class="h-8 w-auto" />
        <p class="text-xs mt-2" style="color: #9ca3af">Admin Panel</p>
      </div>

      <nav class="flex-1 px-3 space-y-1">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
            style="{$page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href + '/') && item.href !== '/admin') ? 'background: rgba(245,197,24,0.1); color: #F5C518' : 'color: #9ca3af'} hover:color: white"
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        {/each}
      </nav>

      <div class="p-4" style="border-top: 1px solid #1a1a1a">
        <p class="text-xs truncate mb-3" style="color: #9ca3af">{user.email}</p>
        <button
          onclick={logout}
          class="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
          style="color: #9ca3af; border: 1px solid #2a2a2a"
        >
          Odjava
        </button>
        <a href="/" class="block mt-2 text-center text-xs transition-colors hover:text-white" style="color: #9ca3af">← Na stranicu</a>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 ml-64 p-8">
      {@render children()}
    </main>
  </div>
{/if}
