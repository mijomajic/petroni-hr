<script lang="ts">
  import { onMount } from 'svelte';
  import { booking, resetBooking } from '$lib/stores/booking';
  import { supabase } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import type { Vehicle } from '$lib/supabase';
  import { bookingExtras } from '$lib/mock/bookingExtras';

  const seedLocations = [
    'Zagreb Depot', 'Zagreb City Centre', 'Zagreb Airport', 'Split Airport', 'Dubrovnik Airport',
    'Pula Airport', 'Zadar Airport', 'Krk (Rijeka) Airport', 'Ljubljana Airport', 'Budapest Airport', 'Vienna Airport',
  ];

  const seedVehicles: Vehicle[] = [
    { id: '1', slug: 'weinsberg-caraone-550qdk', name: 'Weinsberg CaraOne 550QDK', type: 'rental', category: 'COMFORT', seats: 4, bags: 4, price_per_day: 120, sale_price: null, description_hr: 'Udoban obiteljski karavan.', description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: { length: '8.5m', beds: 4 }, is_available: true, created_at: '' },
    { id: '2', slug: 'weinsberg-caraone-550uk', name: 'Weinsberg CaraOne 550UK', type: 'rental', category: 'ECO', seats: 4, bags: 3, price_per_day: 95, sale_price: null, description_hr: 'Kompaktan i ekonomičan.', description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: { length: '7.9m', beds: 2 }, is_available: true, created_at: '' },
    { id: '3', slug: 'caratour-ford-600mq', name: 'CaraTour Ford 600MQ', type: 'rental', category: 'ELITE', seats: 6, bags: 5, price_per_day: 180, sale_price: null, description_hr: 'Luksuzni motorhome.', description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: { length: '9.2m', beds: 6 }, is_available: true, created_at: '' },
  ];

  let locations: string[] = $state(seedLocations);
  let availableVehicles: Vehicle[] = $state([]);
  let loading = $state(false);
  let paymentMethod = $state<'stripe' | 'paypal'>('stripe');

  const steps = $derived($locale === 'hr'
    ? ['Datum i Vrijeme', 'Pretražite vozila', 'Detalji vozača', 'Pregled rezervacije']
    : ['Date & Time', 'Search vehicles', 'Driver details', 'Review booking']);

  function getDays(): number {
    if (!$booking.pickupDate || !$booking.dropoffDate) return 0;
    const a = new Date($booking.pickupDate), b = new Date($booking.dropoffDate);
    return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / 86400000));
  }
  const days = $derived(getDays());
  const vehicleSubtotal = $derived($booking.selectedVehicle ? ($booking.selectedVehicle.price_per_day ?? 0) * days : 0);
  const selectedExtras = $derived(bookingExtras
    .map(extra => ({ extra, qty: $booking.extras[extra.id] ?? 0 }))
    .filter(e => e.qty > 0));
  const extrasTotal = $derived(selectedExtras.reduce((sum, e) => sum + e.extra.price * e.qty, 0));
  const totalPrice = $derived(vehicleSubtotal + extrasTotal);

  function setExtraQty(id: string, qty: number, maxQty: number) {
    const bounded = Math.max(0, Math.min(maxQty, qty));
    booking.update(b => ({ ...b, extras: { ...b.extras, [id]: bounded } }));
  }

  function selectVehicle(vehicle: Vehicle) {
    booking.update(b => {
      const extras = { ...b.extras };
      for (const extra of bookingExtras) {
        if (extra.is_required && !extras[extra.id]) extras[extra.id] = 1;
      }
      return { ...b, selectedVehicle: vehicle, extras };
    });
  }

  async function searchVehicles() {
    loading = true;
    availableVehicles = seedVehicles;
    booking.update(b => ({ ...b, step: 2 }));
    loading = false;
    supabase.from('vehicles').select('*').eq('type', 'rental').eq('is_available', true)
      .then(({ data }) => { if (data?.length) availableVehicles = data; });
  }

  async function submitBooking() {
    if (!$booking.selectedVehicle) return;
    loading = true;
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...$booking, total_price: totalPrice, payment_method: paymentMethod }),
      });
      const data = await res.json();
      if (data.success) { resetBooking(); window.location.href = '/rezerviraj/success'; }
    } catch (e) { console.error(e); } finally { loading = false; }
  }

  onMount(() => {
    supabase.from('rental_locations').select('name').order('sort_order')
      .then(({ data }) => { if (data?.length) locations = data.map(l => l.name); });
  });

  const driverFields = $derived($locale === 'hr' ? [
    { key: 'firstName', label: 'Ime', type: 'text' }, { key: 'lastName', label: 'Prezime', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Telefon', type: 'tel' },
    { key: 'dateOfBirth', label: 'Datum rođenja', type: 'date' }, { key: 'licenseNumber', label: 'Broj vozačke dozvole', type: 'text' },
    { key: 'licenseCountry', label: 'Zemlja vozačke', type: 'text' }, { key: 'address', label: 'Adresa', type: 'text' },
    { key: 'city', label: 'Grad', type: 'text' }, { key: 'zip', label: 'Poštanski broj', type: 'text' }, { key: 'country', label: 'Država', type: 'text' },
  ] : [
    { key: 'firstName', label: 'First name', type: 'text' }, { key: 'lastName', label: 'Last name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'dateOfBirth', label: 'Date of birth', type: 'date' }, { key: 'licenseNumber', label: 'License number', type: 'text' },
    { key: 'licenseCountry', label: 'License country', type: 'text' }, { key: 'address', label: 'Address', type: 'text' },
    { key: 'city', label: 'City', type: 'text' }, { key: 'zip', label: 'ZIP', type: 'text' }, { key: 'country', label: 'Country', type: 'text' },
  ]);
</script>

<svelte:head><title>Rezervacija — Petroni</title></svelte:head>

<div class="section" style="background:#fafbfc">
  <div class="container-x">
    <!-- Progress -->
    <div class="flex items-start justify-center mb-12 max-w-3xl mx-auto">
      {#each steps as step, i}
        <div class="flex items-center {i < steps.length - 1 ? 'flex-1' : ''}">
          <div class="flex flex-col items-center gap-2 text-center">
            <div class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style="{$booking.step >= i + 1 ? 'background:#f5c518;color:#fff' : 'background:#fff;color:#b9bdc4;border:2px solid #e2e4e8'}">
              {#if $booking.step > i + 1}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              {:else}{i + 1}{/if}
            </div>
            <span class="text-[11px] leading-tight max-w-[90px]" style="color:{$booking.step >= i + 1 ? '#2b2b2b' : '#9aa0a8'}">{step}</span>
          </div>
          {#if i < steps.length - 1}
            <div class="flex-1 h-0.5 mx-2 mt-[-22px]" style="background:{$booking.step > i + 1 ? '#f5c518' : '#e2e4e8'}"></div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Step 1 -->
    {#if $booking.step === 1}
      <div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 max-w-5xl mx-auto">
        <!-- Sidebar -->
        <aside class="card p-6 h-fit text-[13px] text-[#6b7178] leading-relaxed">
          <p class="font-bold text-[#2b2b2b] mb-1">{$locale === 'hr' ? 'Vrijeme preuzimanja vozila' : 'Vehicle pickup hours'}</p>
          <p>{$locale === 'hr' ? 'Ponedjeljak – Subota' : 'Monday – Saturday'}</p>
          <p>Zagreb depot: 13:00–15:00</p>
          <p class="mb-4">{$locale === 'hr' ? 'Ostale lokacije' : 'Other locations'}: 11:00–13:00</p>
          <p class="font-bold text-[#2b2b2b] mb-1">{$locale === 'hr' ? 'Vrijeme povrata vozila' : 'Vehicle return hours'}</p>
          <p>{$locale === 'hr' ? 'Ponedjeljak – Subota' : 'Monday – Saturday'}</p>
          <p>Zagreb depot: 08:00–10:00</p>
          <p class="mb-4">{$locale === 'hr' ? 'Ostale lokacije' : 'Other locations'}: 13:00–15:00</p>
          <p class="text-[12px] text-[#9aa0a8]">{$locale === 'hr' ? 'Preuzimanje i povrat vozila izvan definiranog vremenskog okvira naplaćuje se prema važećem cjeniku.' : 'Pickup and return outside the defined time window are charged per the current price list.'}</p>
        </aside>

        <!-- Form -->
        <div class="card p-6 md:p-8">
          <!-- Pickup -->
          <div class="mb-8">
            <span class="inline-block px-4 py-1.5 rounded-t-md text-[11px] font-bold uppercase tracking-wide text-white" style="background:#f5c518">{$locale === 'hr' ? 'Preuzimanje' : 'Pickup'}</span>
            <div class="border-t-2 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5" style="border-color:#f5c518">
              <div class="md:col-span-2">
                <span class="field-label">{$locale === 'hr' ? 'Mjesto preuzimanja vozila' : 'Pickup location'}</span>
                <select class="field" bind:value={$booking.pickupLocation}>
                  <option value="">{$locale === 'hr' ? 'Odaberite lokaciju' : 'Select location'}</option>
                  {#each locations as loc}<option value={loc}>{loc}</option>{/each}
                </select>
              </div>
              <div><span class="field-label">{$locale === 'hr' ? 'Datum preuzimanja' : 'Pickup date'}</span><input type="date" class="field" min={new Date().toISOString().split('T')[0]} bind:value={$booking.pickupDate} /></div>
              <div><span class="field-label">{$locale === 'hr' ? 'Vrijeme preuzimanja' : 'Pickup time'}</span><input type="time" class="field" bind:value={$booking.pickupTime} /></div>
            </div>
          </div>

          <!-- Return -->
          <div class="mb-8">
            <span class="inline-block px-4 py-1.5 rounded-t-md text-[11px] font-bold uppercase tracking-wide text-white" style="background:#f5c518">{$locale === 'hr' ? 'Povratak' : 'Return'}</span>
            <div class="border-t-2 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5" style="border-color:#f5c518">
              <div class="md:col-span-2">
                <span class="field-label">{$locale === 'hr' ? 'Mjesto povratka vozila' : 'Return location'}</span>
                <select class="field" bind:value={$booking.dropoffLocation}>
                  <option value="">{$locale === 'hr' ? 'Ista kao preuzimanje' : 'Same as pickup'}</option>
                  {#each locations as loc}<option value={loc}>{loc}</option>{/each}
                </select>
              </div>
              <div><span class="field-label">{$locale === 'hr' ? 'Datum povratka' : 'Return date'}</span><input type="date" class="field" min={$booking.pickupDate || new Date().toISOString().split('T')[0]} bind:value={$booking.dropoffDate} /></div>
              <div><span class="field-label">{$locale === 'hr' ? 'Vrijeme povratka' : 'Return time'}</span><input type="time" class="field" bind:value={$booking.dropoffTime} /></div>
            </div>
          </div>

          <!-- Age -->
          <div class="mb-8">
            <span class="inline-block px-4 py-1.5 rounded-t-md text-[11px] font-bold uppercase tracking-wide text-white" style="background:#f5c518">{$locale === 'hr' ? 'Starost vozača' : 'Driver age'}</span>
            <div class="border-t-2 pt-5" style="border-color:#f5c518">
              <span class="field-label">{$locale === 'hr' ? 'Starost vozača' : 'Driver age'}</span>
              <input type="number" min="21" max="99" class="field" bind:value={$booking.driverAge} />
            </div>
          </div>

          <div class="flex justify-end">
            <button onclick={searchVehicles} disabled={!$booking.pickupLocation || !$booking.pickupDate || !$booking.dropoffDate || loading} class="btn btn-primary px-8 py-3.5 disabled:opacity-50">
              {loading ? ($locale === 'hr' ? 'Učitavanje…' : 'Loading…') : ($locale === 'hr' ? 'Pretražite vozila' : 'Search vehicles')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Step 2 -->
    {#if $booking.step === 2}
      <div class="max-w-5xl mx-auto space-y-6">
        {#if days > 0}
          <div class="card p-4 flex items-center gap-3 text-sm" style="background:#fffaf0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="text-[#6b7178]"><b class="text-[#2b2b2b]">{$booking.pickupDate}</b> → <b class="text-[#2b2b2b]">{$booking.dropoffDate}</b> <span style="color:#b5890a" class="font-semibold">({days} {$locale === 'hr' ? (days === 1 ? 'dan' : 'dana') : 'days'})</span></span>
          </div>
        {/if}
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <!-- Vehicles: single column -->
          <div class="flex flex-col gap-4">
            {#each availableVehicles as vehicle}
              <button onclick={() => selectVehicle(vehicle)} class="card text-left overflow-hidden flex flex-row" style="border-color:{$booking.selectedVehicle?.id === vehicle.id ? '#f5c518' : '#ededf0'}">
                <div class="w-40 sm:w-56 flex-shrink-0 overflow-hidden bg-[#f3f4f6]"><img src={vehicle.images?.[0]} alt={vehicle.name} class="w-full h-full object-cover" /></div>
                <div class="p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 class="font-semibold text-[#2b2b2b] mb-1">{vehicle.name}</h3>
                    <p class="text-xs text-[#9aa0a8]">{vehicle.category} · {vehicle.seats} {$locale === 'hr' ? 'sjedala' : 'seats'}</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right"><span class="text-xl font-bold text-[#2b2b2b]">{(vehicle.price_per_day ?? 0) * days} €</span> <span class="text-xs text-[#9aa0a8] block">({days} × {vehicle.price_per_day} €)</span></div>
                    <span class="btn btn-primary px-4 py-2 text-[11px] flex-shrink-0">{$locale === 'hr' ? 'Odaberi' : 'Select'}</span>
                  </div>
                </div>
              </button>
            {/each}
          </div>

          <!-- Extras + summary: right column -->
          <div class="flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
            <div class="card p-6">
              <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Dodatna oprema' : 'Extras'}</h2>
              {#if !$booking.selectedVehicle}
                <p class="text-sm text-[#9aa0a8]">{$locale === 'hr' ? 'Odaberite vozilo za prikaz dodatne opreme.' : 'Select a vehicle to view extras.'}</p>
              {:else}
                <div class="divide-y divide-[#ededf0]">
                  {#each bookingExtras as extra}
                    {@const qty = $booking.extras[extra.id] ?? 0}
                    <div class="flex flex-col gap-2 py-3">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-[#2b2b2b] flex-1">{$locale === 'hr' ? extra.name_hr : extra.name_en}</span>
                        {#if extra.is_required}
                          <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style="background:#fff7e0;color:#b5890a">{$locale === 'hr' ? 'Obavezno' : 'Required'}</span>
                        {/if}
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-[#7a7f86]">{extra.price} €</span>
                        {#if extra.max_qty > 1}
                          <div class="flex items-center rounded-md overflow-hidden border border-[#e2e4e8]">
                            <button onclick={() => setExtraQty(extra.id, qty - 1, extra.max_qty)} disabled={extra.is_required} class="px-3 py-1.5 font-bold text-[#2b2b2b] hover:bg-[#f6f7f9] disabled:opacity-40">−</button>
                            <span class="px-3 text-sm font-semibold text-[#2b2b2b]">{qty}</span>
                            <button onclick={() => setExtraQty(extra.id, qty + 1, extra.max_qty)} disabled={extra.is_required} class="px-3 py-1.5 font-bold text-[#2b2b2b] hover:bg-[#f6f7f9] disabled:opacity-40">+</button>
                          </div>
                        {:else}
                          <button onclick={() => setExtraQty(extra.id, qty > 0 ? 0 : 1, extra.max_qty)} disabled={extra.is_required}
                            class="px-4 py-1.5 rounded-md text-[11px] font-bold uppercase disabled:opacity-60"
                            style="{qty > 0 ? 'background:#f5c518;color:#fff' : 'background:#f6f7f9;color:#5b6168'}">
                            {qty > 0 ? ($locale === 'hr' ? 'Odabrano' : 'Selected') : ($locale === 'hr' ? 'Dodaj' : 'Add')}
                          </button>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            {#if $booking.selectedVehicle}
              <div class="card p-6">
                <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Sažetak' : 'Summary'}</h2>
                <div class="space-y-2 mb-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-[#7a7f86]">{$locale === 'hr' ? 'Vozilo' : 'Vehicle'} ({$booking.selectedVehicle.price_per_day} € × {days})</span>
                    <span class="text-[#2b2b2b]">{vehicleSubtotal} €</span>
                  </div>
                  {#each selectedExtras as { extra, qty }}
                    <div class="flex justify-between text-sm">
                      <span class="text-[#7a7f86]">{$locale === 'hr' ? extra.name_hr : extra.name_en} × {qty}</span>
                      <span class="text-[#2b2b2b]">{extra.price * qty} €</span>
                    </div>
                  {/each}
                </div>
                <div class="pt-3 flex justify-between font-bold text-lg border-t border-[#ededf0] mb-5">
                  <span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Ukupno' : 'Total'}</span>
                  <span style="color:#b5890a">{totalPrice} €</span>
                </div>
                <button onclick={() => booking.update(b => ({ ...b, step: 3 }))} class="btn btn-primary w-full">{$locale === 'hr' ? 'Nastavi' : 'Continue'} →</button>
              </div>
            {/if}
          </div>
        </div>

        <button onclick={() => booking.update(b => ({ ...b, step: 1 }))} class="text-sm text-[#7a7f86] hover:text-[#2b2b2b]">← {$locale === 'hr' ? 'Natrag' : 'Back'}</button>
      </div>
    {/if}

    <!-- Step 3 -->
    {#if $booking.step === 3}
      <div class="card p-6 md:p-8 max-w-4xl mx-auto">
        {#if $booking.selectedVehicle}
          <div class="flex items-center gap-4 mb-7 p-4 rounded-md bg-[#f6f7f9]">
            <img src={$booking.selectedVehicle.images?.[0]} alt="" class="w-20 h-14 object-cover rounded-md" />
            <div><p class="font-semibold text-[#2b2b2b]">{$booking.selectedVehicle.name}</p><p class="text-sm text-[#7a7f86]">{totalPrice} € {$locale === 'hr' ? 'ukupno' : 'total'} ({days} {$locale === 'hr' ? 'dana' : 'days'})</p></div>
          </div>
        {/if}
        <h2 class="text-lg font-bold uppercase tracking-wide text-[#2b2b2b] mb-6">{$locale === 'hr' ? 'Podaci vozača' : 'Driver details'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          {#each driverFields as field}
            <div class="{field.key === 'address' || field.key === 'email' ? 'md:col-span-2' : ''}">
              <span class="field-label">{field.label}</span>
              <input type={field.type} class="field" bind:value={$booking.driverDetails[field.key as keyof typeof $booking.driverDetails]} />
            </div>
          {/each}
        </div>
        <div class="flex gap-4 mt-8">
          <button onclick={() => booking.update(b => ({ ...b, step: 2 }))} class="btn btn-ghost px-6 py-3">← {$locale === 'hr' ? 'Natrag' : 'Back'}</button>
          <button onclick={() => booking.update(b => ({ ...b, step: 4 }))} class="btn btn-primary flex-1">{$locale === 'hr' ? 'Nastavi' : 'Continue'} →</button>
        </div>
      </div>
    {/if}

    <!-- Step 4 -->
    {#if $booking.step === 4}
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="card p-6 md:p-8">
          <h2 class="text-lg font-bold uppercase tracking-wide text-[#2b2b2b] mb-6">{$locale === 'hr' ? 'Pregled rezervacije' : 'Review booking'}</h2>
          {#if $booking.selectedVehicle}
            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-[#ededf0]">
              <img src={$booking.selectedVehicle.images?.[0]} alt="" class="w-24 h-16 object-cover rounded-md" />
              <div><p class="font-bold text-[#2b2b2b] text-lg">{$booking.selectedVehicle.name}</p><p class="text-sm text-[#7a7f86]">{$booking.selectedVehicle.category}</p></div>
            </div>
          {/if}
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div><p class="field-label">{$locale === 'hr' ? 'Preuzimanje' : 'Pickup'}</p><p class="text-sm text-[#2b2b2b]">{$booking.pickupDate} · {$booking.pickupTime}</p><p class="text-sm font-medium" style="color:#b5890a">{$booking.pickupLocation}</p></div>
            <div><p class="field-label">{$locale === 'hr' ? 'Povrat' : 'Return'}</p><p class="text-sm text-[#2b2b2b]">{$booking.dropoffDate} · {$booking.dropoffTime}</p><p class="text-sm font-medium" style="color:#b5890a">{$booking.dropoffLocation || $booking.pickupLocation}</p></div>
          </div>
          <div class="space-y-2 mb-6 pb-6 border-b border-[#ededf0]">
            <div class="flex justify-between text-sm"><span class="text-[#7a7f86]">{$locale === 'hr' ? 'Vozilo' : 'Vehicle'}: {$booking.selectedVehicle?.price_per_day} € × {days} {$locale === 'hr' ? 'dana' : 'days'}</span><span class="text-[#2b2b2b]">{vehicleSubtotal} €</span></div>
            {#each selectedExtras as { extra, qty }}
              <div class="flex justify-between text-sm"><span class="text-[#7a7f86]">{$locale === 'hr' ? extra.name_hr : extra.name_en} × {qty}</span><span class="text-[#2b2b2b]">{extra.price * qty} €</span></div>
            {/each}
            <div class="flex justify-between font-bold text-lg pt-2"><span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Ukupno' : 'Total'}</span><span style="color:#b5890a">{totalPrice} €</span></div>
          </div>
          <p class="text-sm text-[#6b7178]"><b class="text-[#2b2b2b]">{$booking.driverDetails.firstName} {$booking.driverDetails.lastName}</b> · {$booking.driverDetails.email} · {$booking.driverDetails.phone}</p>
        </div>

        <div class="card p-6 md:p-8">
          <h2 class="text-lg font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Način plaćanja' : 'Payment method'}</h2>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <button onclick={() => paymentMethod = 'stripe'} class="p-4 rounded-md text-center" style="border:2px solid {paymentMethod === 'stripe' ? '#f5c518' : '#e2e4e8'}"><p class="font-semibold text-[#2b2b2b] text-sm">{$locale === 'hr' ? 'Kartica' : 'Card'}</p><p class="text-xs text-[#9aa0a8] mt-1">Visa, Mastercard</p></button>
            <button onclick={() => paymentMethod = 'paypal'} class="p-4 rounded-md text-center" style="border:2px solid {paymentMethod === 'paypal' ? '#f5c518' : '#e2e4e8'}"><p class="font-semibold text-[#2b2b2b] text-sm">PayPal</p><p class="text-xs text-[#9aa0a8] mt-1">PayPal {$locale === 'hr' ? 'račun' : 'account'}</p></button>
          </div>
          <div class="rounded-md p-4 mb-6 bg-[#f6f7f9] border border-[#ededf0]"><p class="text-sm text-center text-[#7a7f86]">{$locale === 'hr' ? 'Plaćanje se aktivira nakon postavljanja API ključeva.' : 'Payment activates once API keys are configured.'}</p></div>
          <div class="flex gap-4">
            <button onclick={() => booking.update(b => ({ ...b, step: 3 }))} class="btn btn-ghost px-6 py-3">← {$locale === 'hr' ? 'Natrag' : 'Back'}</button>
            <button onclick={submitBooking} disabled={loading} class="btn btn-primary flex-1 disabled:opacity-50">{loading ? ($locale === 'hr' ? 'Obrađujem…' : 'Processing…') : `${$locale === 'hr' ? 'Potvrdi rezervaciju' : 'Confirm booking'} — ${totalPrice} €`}</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
