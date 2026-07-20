<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  function product(notification: (typeof data.notifications)[number]) {
    return Array.isArray(notification.products) ? notification.products[0] : notification.products;
  }

  function dateTime(value: string | null) {
    return value ? new Intl.DateTimeFormat('hr-HR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
  }
</script>

<svelte:head><title>Obavijesti o dostupnosti — Admin — Petroni</title></svelte:head>

<div class="max-w-[1500px]">
  <header class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Shop</p>
      <h1 class="mt-2 text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Obavijesti o dostupnosti</h1>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-[#7a7f86]">Kupci ostavljaju email za rasprodani proizvod. Prijave se automatski šalju kada spremite dostupnu zalihu veću od nule ili otkazivanje narudžbe oslobodi rezerviranu zalihu.</p>
    </div>
    <div class="rounded-xl border border-[#e7e8eb] bg-white px-5 py-3 text-sm text-[#5b6168]"><b class="text-[#2b2b2b]">{data.pendingCount}</b> čeka slanje</div>
  </header>

  {#if form?.message}<div class="mb-6 rounded-xl border border-[#eadfba] bg-[#fffaf0] p-4 text-sm text-[#6f5600]">{form.message}</div>{/if}

  <nav class="mb-6 flex flex-wrap gap-2" aria-label="Status prijava">
    {#each [{ key: 'pending', label: 'Čeka' }, { key: 'sent', label: 'Poslano' }, { key: 'cancelled', label: 'Otkazano' }] as item}
      <a href="?status={item.key}" class="rounded-md border px-4 py-2 text-xs font-bold {data.status === item.key ? 'border-[#f5c518] bg-[#fff7d6] text-[#725700]' : 'border-[#dfe1e5] bg-white text-[#5b6168]'}">{item.label}</a>
    {/each}
  </nav>

  {#if data.notifications.length === 0}
    <div class="border-t border-[#e2e4e8] py-16 text-center">
      <p class="font-bold text-[#454a50]">Nema prijava u ovom statusu.</p>
      <p class="mt-2 text-sm text-[#8b9099]">Nove prijave pojavit će se kada kupac zatraži obavijest za rasprodani proizvod.</p>
    </div>
  {:else}
    <div class="overflow-x-auto rounded-xl border border-[#e2e3e6] bg-white">
      <table class="w-full min-w-[980px] text-left text-sm">
        <thead class="border-b border-[#e7e8eb] bg-[#fafbfc] text-[11px] uppercase tracking-[0.12em] text-[#7a7f86]">
          <tr><th class="px-5 py-4">Proizvod</th><th class="px-5 py-4">Kupac</th><th class="px-5 py-4">Prijava</th><th class="px-5 py-4">Status</th><th class="px-5 py-4">Pokušaji</th><th class="px-5 py-4 text-right">Radnja</th></tr>
        </thead>
        <tbody class="divide-y divide-[#ededf0]">
          {#each data.notifications as notification}
            {@const item = product(notification)}
            <tr class="align-top">
              <td class="px-5 py-4"><a href="/admin/proizvodi/{notification.product_id}" class="font-bold text-[#2b2b2b] hover:text-[#806300]">{item?.name_hr ?? 'Obrisan proizvod'}</a><p class="mt-1 text-xs text-[#8b9099]">Zaliha: {item?.stock ?? '—'}</p></td>
              <td class="px-5 py-4"><p class="font-medium text-[#454a50]">{notification.email}</p><p class="mt-1 text-xs uppercase text-[#8b9099]">{notification.locale}</p></td>
              <td class="px-5 py-4 text-[#5b6168]">{dateTime(notification.requested_at)}{#if notification.notified_at}<p class="mt-1 text-xs text-[#27824a]">Poslano {dateTime(notification.notified_at)}</p>{/if}</td>
              <td class="px-5 py-4"><span class="rounded px-2 py-1 text-xs font-bold {notification.status === 'sent' ? 'bg-[#eaf7ef] text-[#207240]' : notification.status === 'pending' ? 'bg-[#fff7d6] text-[#725700]' : 'bg-[#f1f2f4] text-[#6b7178]'}">{notification.status === 'sent' ? 'Poslano' : notification.status === 'pending' ? 'Čeka' : 'Otkazano'}</span>{#if notification.last_error}<p class="mt-2 max-w-xs text-xs leading-relaxed text-[#9f1f18]">{notification.last_error}</p>{/if}</td>
              <td class="px-5 py-4 text-[#5b6168]">{notification.attempt_count}</td>
              <td class="px-5 py-4 text-right">
                {#if notification.status === 'pending'}
                  <form method="POST" action="?/sendForProduct"><input type="hidden" name="product_id" value={notification.product_id} /><button class="rounded-md border border-[#d9dce1] px-3 py-2 text-xs font-bold text-[#454a50] hover:border-[#f5c518]">Pošalji za proizvod</button></form>
                {:else}<span class="text-xs text-[#a0a4aa]">—</span>{/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
