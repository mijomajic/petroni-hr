<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  const stats = $derived(data.stats);
  const recentBookings = $derived(data.recentBookings);
</script>

<svelte:head><title>Dashboard — Admin — Petroni</title></svelte:head>

<div>
  <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b] mb-8">Dashboard</h1>

  <!-- Stats -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
    {#each [
      { label: 'Rezervacije (čeka)', value: stats.pendingBookings, icon: '📅', color: '#F5C518' },
      { label: 'Vozila', value: stats.vehicles, icon: '🚐', color: '#3b82f6' },
      { label: 'Narudžbe (čeka)', value: stats.orders, icon: '🛒', color: '#8b5cf6' },
      { label: 'Prihod (€)', value: stats.revenue, icon: '💰', color: '#16a34a' },
    ] as stat}
      <div class="p-6 rounded-2xl" style="background: #ffffff; border: 1px solid #ededf0">
        <div class="text-2xl mb-2">{stat.icon}</div>
        <div class="text-3xl font-black mb-1" style="color: {stat.color}">{stat.value}</div>
        <div class="text-xs uppercase tracking-widest font-medium" style="color: #7a7f86">{stat.label}</div>
      </div>
    {/each}
  </div>

  <!-- Recent bookings -->
  <div class="p-6 rounded-2xl" style="background: #ffffff; border: 1px solid #ededf0">
    <h2 class="font-bold text-[#2b2b2b] mb-4 text-sm uppercase tracking-widest">Nedavne rezervacije</h2>
    {#if recentBookings.length === 0}
      <p class="text-sm" style="color: #7a7f86">Nema rezervacija.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="border-bottom: 1px solid #e7e8eb">
              {#each ['Broj', 'Vozač', 'Preuzimanje', 'Povrat', 'Status', 'Plaćanje', 'Detalji'] as h}
                <th class="text-left py-2 pr-4 text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">{h}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each recentBookings as b}
              <tr class="transition-colors hover:bg-[#f6f7f9]" style="border-bottom: 1px solid #f0f1f3">
                <td class="py-3 pr-4 font-mono text-xs text-[#2b2b2b]">{b.confirmation_number ?? b.id.slice(0, 8)}</td>
                <td class="py-3 pr-4 text-[#2b2b2b]">{b.driver_name}</td>
                <td class="py-3 pr-4" style="color: #7a7f86">{b.pickup_date}</td>
                <td class="py-3 pr-4" style="color: #7a7f86">{b.dropoff_date}</td>
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
                <td class="py-3">
                  <a href="/admin/rezervacije/{b.id}" class="inline-flex px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F5C518] text-black">Otvori</a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
