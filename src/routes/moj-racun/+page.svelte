<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
  let activeTab = $state<'bookings' | 'orders' | 'profile'>('bookings');

  const statusLabels: Record<string, string> = {
    pending: 'Na čekanju',
    confirmed: 'Potvrđeno',
    cancelled: 'Otkazano',
    completed: 'Završeno',
    processing: 'U obradi',
    shipped: 'Poslano',
    delivered: 'Dostavljeno'
  };

  function formatDate(value: string | null): string {
    if (!value) return '—';
    return new Intl.DateTimeFormat('hr-HR', { dateStyle: 'medium' }).format(new Date(value));
  }

  function money(value: number): string {
    return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(value);
  }
</script>

<svelte:head>
  <title>Moj račun — Petroni</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="section" style="background:#fafbfc">
  <div class="container-x max-w-6xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-9">
      <div>
        <span class="eyebrow mb-2">Korisnički račun</span>
        <h1 class="section-title">Pozdrav, {data.profile.firstName || 'putnik'}.</h1>
        <p class="text-sm text-[#7a7f86] mt-2">{data.profile.email}</p>
      </div>
      <form method="POST" action="/odjava">
        <button class="btn btn-ghost" type="submit">Odjavi se</button>
      </form>
    </div>

    <div class="flex gap-2 mb-7 overflow-x-auto pb-1">
      <button onclick={() => activeTab = 'bookings'} class="btn whitespace-nowrap" class:btn-primary={activeTab === 'bookings'} class:btn-ghost={activeTab !== 'bookings'}>
        Moje rezervacije ({data.bookings.length})
      </button>
      <button onclick={() => activeTab = 'orders'} class="btn whitespace-nowrap" class:btn-primary={activeTab === 'orders'} class:btn-ghost={activeTab !== 'orders'}>
        Moje narudžbe ({data.orders.length})
      </button>
      <button onclick={() => activeTab = 'profile'} class="btn whitespace-nowrap" class:btn-primary={activeTab === 'profile'} class:btn-ghost={activeTab !== 'profile'}>
        Moj profil
      </button>
    </div>

    {#if activeTab === 'bookings'}
      <div class="space-y-4">
        {#each data.bookings as booking}
          <article class="card p-5 md:p-7">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div class="flex items-center gap-4">
                {#if booking.vehicles?.images?.[0]}
                  <img src={booking.vehicles.images[0]} alt="" class="w-24 h-16 rounded-md object-cover bg-[#f3f4f6]" />
                {/if}
                <div>
                  <p class="font-bold text-[#2b2b2b]">{booking.vehicles?.name ?? 'Rezervacija vozila'}</p>
                  <p class="text-xs text-[#9aa0a8] mt-1">#{booking.confirmation_number ?? booking.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <span class="self-start md:self-auto text-xs font-bold uppercase rounded-full px-3 py-1.5" style="background:#fff7d6;color:#8a6500">
                {statusLabels[booking.status] ?? booking.status}
              </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#ededf0]">
              <div><p class="field-label">Preuzimanje</p><p class="text-sm text-[#2b2b2b]">{formatDate(booking.pickup_date)}</p></div>
              <div><p class="field-label">Povrat</p><p class="text-sm text-[#2b2b2b]">{formatDate(booking.dropoff_date)}</p></div>
              <div><p class="field-label">Lokacija</p><p class="text-sm text-[#2b2b2b]">{booking.pickup_location}</p></div>
              <div><p class="field-label">Ukupno</p><p class="text-sm font-bold text-[#2b2b2b]">{money(booking.total_price)}</p></div>
            </div>
          </article>
        {:else}
          <div class="card p-10 text-center">
            <h2 class="font-bold text-[#2b2b2b] mb-2">Još nemate rezervacija</h2>
            <p class="text-sm text-[#7a7f86] mb-6">Kada pošaljete zahtjev, ovdje ćete moći pratiti njegov status.</p>
            <a class="btn btn-primary" href="/rezerviraj">Rezervirajte vozilo</a>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'orders'}
      <div class="space-y-4">
        {#each data.orders as order}
          <article class="card p-5 md:p-7">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p class="font-bold text-[#2b2b2b]">Narudžba #{order.confirmation_number ?? order.id.slice(0, 8).toUpperCase()}</p>
                <p class="text-sm text-[#7a7f86] mt-1">{formatDate(order.created_at)} · {Array.isArray(order.items) ? order.items.length : 0} stavki</p>
              </div>
              <div class="sm:text-right">
                <span class="text-xs font-bold uppercase rounded-full px-3 py-1.5" style="background:#fff7d6;color:#8a6500">{statusLabels[order.status] ?? order.status}</span>
                <p class="font-bold text-[#2b2b2b] mt-3">{money(order.total)}</p>
              </div>
            </div>
          </article>
        {:else}
          <div class="card p-10 text-center">
            <h2 class="font-bold text-[#2b2b2b] mb-2">Još nemate narudžbi</h2>
            <p class="text-sm text-[#7a7f86] mb-6">Vaše shop narudžbe prikazat će se ovdje.</p>
            <a class="btn btn-primary" href="/shop">Posjetite shop</a>
          </div>
        {/each}
      </div>
    {:else}
      <form method="POST" action="?/profile" class="card p-6 md:p-8 max-w-3xl">
        <h2 class="text-lg font-bold uppercase tracking-wide text-[#2b2b2b] mb-6">Osnovni podaci</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label class="field-label" for="first_name">Ime *</label><input id="first_name" name="first_name" class="field" value={data.profile.firstName} required /></div>
          <div><label class="field-label" for="last_name">Prezime *</label><input id="last_name" name="last_name" class="field" value={data.profile.lastName} required /></div>
          <div><label class="field-label" for="phone">Telefon</label><input id="phone" name="phone" type="tel" class="field" value={data.profile.phone} /></div>
          <div><label class="field-label" for="email">Email</label><input id="email" class="field" value={data.profile.email} disabled /></div>
          <div class="md:col-span-2"><label class="field-label" for="address">Adresa</label><input id="address" name="address" class="field" value={data.profile.address} /></div>
          <div><label class="field-label" for="city">Grad</label><input id="city" name="city" class="field" value={data.profile.city} /></div>
          <div><label class="field-label" for="zip">Poštanski broj</label><input id="zip" name="zip" class="field" value={data.profile.zip} /></div>
          <div class="md:col-span-2"><label class="field-label" for="country">Država</label><input id="country" name="country" class="field" value={data.profile.country} /></div>
        </div>

        {#if form?.profileError}
          <p class="rounded-md px-4 py-3 text-sm mt-5" style="background:#fdecec;color:#b42318">{form.profileError}</p>
        {:else if form?.profileSuccess}
          <p class="rounded-md px-4 py-3 text-sm mt-5" style="background:#ecfdf3;color:#067647">Profil je spremljen.</p>
        {/if}

        <button type="submit" class="btn btn-primary mt-7">Spremi promjene</button>
      </form>
    {/if}
  </div>
</section>
