<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let stats = $state({ pendingBookings: 0, vehicles: 0, orders: 0, revenue: 0 });
  let recentBookings: any[] = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const [bookingsRes, vehiclesRes, ordersRes, recentRes] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('vehicles').select('id', { count: 'exact' }),
      supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    stats = {
      pendingBookings: bookingsRes.count ?? 0,
      vehicles: vehiclesRes.count ?? 0,
      orders: ordersRes.count ?? 0,
      revenue: 0,
    };
    recentBookings = recentRes.data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Dashboard — Admin — Petroni</title></svelte:head>

<div>
  <h1 class="text-3xl font-black uppercase tracking-tight text-white mb-8">Dashboard</h1>

  <!-- Stats -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
    {#each [
      { label: 'Rezervacije (čeka)', value: stats.pendingBookings, icon: '📅', color: '#F5C518' },
      { label: 'Vozila', value: stats.vehicles, icon: '🚐', color: '#3b82f6' },
      { label: 'Narudžbe (čeka)', value: stats.orders, icon: '🛒', color: '#8b5cf6' },
      { label: 'Prihod (€)', value: stats.revenue, icon: '💰', color: '#16a34a' },
    ] as stat}
      <div class="p-6 rounded-2xl" style="background: #111; border: 1px solid #1a1a1a">
        <div class="text-2xl mb-2">{stat.icon}</div>
        <div class="text-3xl font-black mb-1" style="color: {stat.color}">{stat.value}</div>
        <div class="text-xs uppercase tracking-widest font-medium" style="color: #9ca3af">{stat.label}</div>
      </div>
    {/each}
  </div>

  <!-- Recent bookings -->
  <div class="p-6 rounded-2xl" style="background: #111; border: 1px solid #1a1a1a">
    <h2 class="font-bold text-white mb-4 text-sm uppercase tracking-widest">Nedavne rezervacije</h2>
    {#if loading}
      <div class="space-y-2">
        {#each [1,2,3] as _}
          <div class="h-12 rounded-xl animate-pulse" style="background: #1a1a1a"></div>
        {/each}
      </div>
    {:else if recentBookings.length === 0}
      <p class="text-sm" style="color: #9ca3af">Nema rezervacija.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="border-bottom: 1px solid #2a2a2a">
              {#each ['ID', 'Vozač', 'Preuzimanje', 'Povrat', 'Status', 'Plaćanje'] as h}
                <th class="text-left py-2 pr-4 text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">{h}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each recentBookings as b}
              <tr class="transition-colors hover:bg-white/3" style="border-bottom: 1px solid #1a1a1a">
                <td class="py-3 pr-4 font-mono text-xs text-white">{b.id.slice(0, 8)}…</td>
                <td class="py-3 pr-4 text-white">{b.driver_name}</td>
                <td class="py-3 pr-4" style="color: #9ca3af">{b.pickup_date}</td>
                <td class="py-3 pr-4" style="color: #9ca3af">{b.dropoff_date}</td>
                <td class="py-3 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style="{b.status === 'confirmed' ? 'background: rgba(22,163,74,0.15); color: #16a34a' : b.status === 'pending' ? 'background: rgba(245,197,24,0.15); color: #F5C518' : 'background: rgba(239,68,68,0.1); color: #ef4444'}">
                    {b.status}
                  </span>
                </td>
                <td class="py-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style="{b.payment_status === 'paid' ? 'background: rgba(22,163,74,0.15); color: #16a34a' : 'background: rgba(245,197,24,0.15); color: #F5C518'}">
                    {b.payment_status}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
