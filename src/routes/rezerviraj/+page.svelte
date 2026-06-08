<script lang="ts">
  import { onMount } from 'svelte';
  import { booking, resetBooking } from '$lib/stores/booking';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';

  let locations: string[] = $state([]);
  let availableVehicles: Vehicle[] = $state([]);
  let loading = $state(false);
  let paymentMethod = $state<'stripe' | 'paypal'>('stripe');

  const seedLocations = [
    'Zagreb Depot', 'Zagreb City Centre', 'Zagreb Airport',
    'Split Airport', 'Dubrovnik Airport', 'Pula Airport',
    'Zadar Airport', 'Krk (Rijeka) Airport', 'Ljubljana Airport',
    'Budapest Airport', 'Vienna Airport',
  ];

  const seedVehicles: Vehicle[] = [
    {
      id: '1', slug: 'weinsberg-caraone-550qdk', name: 'Weinsberg CaraOne 550QDK',
      type: 'rental', category: 'COMFORT', seats: 4, bags: 4, price_per_day: 120, sale_price: null,
      description_hr: 'Udoban obiteljski karavan.', description_en: null,
      images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'],
      specs: { length: '8.5m', beds: 4, weight: '1800kg' }, is_available: true, created_at: ''
    },
    {
      id: '2', slug: 'weinsberg-caraone-550uk', name: 'Weinsberg CaraOne 550UK',
      type: 'rental', category: 'ECO', seats: 4, bags: 3, price_per_day: 95, sale_price: null,
      description_hr: 'Kompaktan i ekonomičan.', description_en: null,
      images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'],
      specs: { length: '7.9m', beds: 2, weight: '1500kg' }, is_available: true, created_at: ''
    },
    {
      id: '3', slug: 'caratour-ford-600mq', name: 'CaraTour Ford 600MQ',
      type: 'rental', category: 'ELITE', seats: 6, bags: 5, price_per_day: 180, sale_price: null,
      description_hr: 'Luksuzni motorhome.', description_en: null,
      images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'],
      specs: { length: '9.2m', beds: 6, weight: '3500kg' }, is_available: true, created_at: ''
    },
  ];

  const steps = ['Datumi', 'Vozilo', 'Vozač', 'Pregled i plaćanje'];

  function getDays(): number {
    if (!$booking.pickupDate || !$booking.dropoffDate) return 0;
    const a = new Date($booking.pickupDate);
    const b = new Date($booking.dropoffDate);
    return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / 86400000));
  }

  const days = $derived(getDays());
  const totalPrice = $derived(
    $booking.selectedVehicle ? ($booking.selectedVehicle.price_per_day ?? 0) * days : 0
  );

  async function searchVehicles() {
    loading = true;
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'rental')
      .eq('is_available', true);
    availableVehicles = data?.length ? data : seedVehicles;
    loading = false;
    booking.update(b => ({ ...b, step: 2 }));
  }

  async function submitBooking() {
    if (!$booking.selectedVehicle) return;
    loading = true;
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...$booking,
          total_price: totalPrice,
          payment_method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        resetBooking();
        window.location.href = '/rezerviraj/success';
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    const { data } = await supabase.from('rental_locations').select('name').order('sort_order');
    locations = data?.map(l => l.name) ?? seedLocations;
  });
</script>

<svelte:head>
  <title>Rezervacija — Petroni</title>
</svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-4xl mx-auto px-4 md:px-6">

    <!-- Header -->
    <div class="text-center mb-12">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">
        Najam kampera
      </span>
      <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">REZERVACIJA</h1>
    </div>

    <!-- Progress indicator -->
    <div class="flex items-center justify-center mb-12">
      {#each steps as step, i}
        <div class="flex items-center">
          <div class="flex flex-col items-center gap-1">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500"
              style="{$booking.step > i + 1 ? 'background: #F5C518; color: black' : $booking.step === i + 1 ? 'background: #F5C518; color: black; box-shadow: 0 0 20px rgba(245,197,24,0.4)' : 'background: #1a1a1a; color: #9ca3af; border: 1px solid #2a2a2a'}"
            >
              {#if $booking.step > i + 1}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {:else}
                {i + 1}
              {/if}
            </div>
            <span class="text-[10px] uppercase tracking-widest hidden md:block" style="color: {$booking.step >= i + 1 ? '#F5C518' : '#9ca3af'}">{step}</span>
          </div>
          {#if i < steps.length - 1}
            <div class="w-16 md:w-24 h-px mx-2 transition-all duration-500" style="background: {$booking.step > i + 1 ? '#F5C518' : '#2a2a2a'}"></div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Step 1: Dates -->
    {#if $booking.step === 1}
      <div class="p-2 rounded-[2rem]" style="border: 1px solid #2a2a2a; background: rgba(255,255,255,0.02)">
        <div class="p-8 rounded-[1.5rem]" style="background: #111">
          <h2 class="text-xl font-bold uppercase tracking-widest mb-8 text-white">Odaberite datume</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">Lokacija preuzimanja</label>
              <select
                class="w-full px-4 py-3 rounded-xl text-white text-sm transition-all duration-200 focus:outline-none"
                style="background: #1a1a1a; border: 1px solid #2a2a2a"
                bind:value={$booking.pickupLocation}
              >
                <option value="">Odaberite lokaciju</option>
                {#each locations as loc}
                  <option value={loc}>{loc}</option>
                {/each}
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">Lokacija povrata</label>
              <select
                class="w-full px-4 py-3 rounded-xl text-white text-sm transition-all duration-200 focus:outline-none"
                style="background: #1a1a1a; border: 1px solid #2a2a2a"
                bind:value={$booking.dropoffLocation}
              >
                <option value="">Ista kao preuzimanje</option>
                {#each locations as loc}
                  <option value={loc}>{loc}</option>
                {/each}
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">Datum preuzimanja</label>
              <input
                type="date"
                class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style="background: #1a1a1a; border: 1px solid #2a2a2a; color-scheme: dark"
                min={new Date().toISOString().split('T')[0]}
                bind:value={$booking.pickupDate}
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">Datum povrata</label>
              <input
                type="date"
                class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style="background: #1a1a1a; border: 1px solid #2a2a2a; color-scheme: dark"
                min={$booking.pickupDate || new Date().toISOString().split('T')[0]}
                bind:value={$booking.dropoffDate}
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">Vrijeme preuzimanja</label>
              <input
                type="time"
                class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style="background: #1a1a1a; border: 1px solid #2a2a2a; color-scheme: dark"
                bind:value={$booking.pickupTime}
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">Vrijeme povrata</label>
              <input
                type="time"
                class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style="background: #1a1a1a; border: 1px solid #2a2a2a; color-scheme: dark"
                bind:value={$booking.dropoffTime}
              />
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">Dob vozača (min. 21 godina)</label>
              <input
                type="number"
                min="21"
                max="99"
                class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style="background: #1a1a1a; border: 1px solid #2a2a2a"
                bind:value={$booking.driverAge}
              />
            </div>
          </div>

          <button
            onclick={searchVehicles}
            disabled={!$booking.pickupLocation || !$booking.pickupDate || !$booking.dropoffDate || loading}
            class="mt-8 w-full flex items-center justify-center gap-3 py-4 rounded-full font-black text-sm uppercase tracking-widest text-black transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
            style="background: #F5C518"
          >
            {loading ? 'Učitavanje...' : 'Pretraži vozila'}
            {#if !loading}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>
    {/if}

    <!-- Step 2: Vehicles -->
    {#if $booking.step === 2}
      <div class="space-y-6">
        {#if days > 0}
          <div class="p-4 rounded-2xl flex items-center gap-4" style="background: rgba(245,197,24,0.05); border: 1px solid rgba(245,197,24,0.2)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #F5C518">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p class="text-sm" style="color: #9ca3af">
              <span class="text-white font-bold">{$booking.pickupDate}</span> → <span class="text-white font-bold">{$booking.dropoffDate}</span>
              <span class="ml-2 font-bold" style="color: #F5C518">({days} {days === 1 ? 'dan' : 'dana'})</span>
            </p>
          </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {#each availableVehicles as vehicle}
            <button
              onclick={() => {
                booking.update(b => ({ ...b, selectedVehicle: vehicle, step: 3 }));
              }}
              class="text-left group rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.01]"
              style="background: #1a1a1a; border: 1px solid {$booking.selectedVehicle?.id === vehicle.id ? '#F5C518' : '#2a2a2a'}"
            >
              <div class="p-2">
                <div class="relative rounded-[1.5rem] overflow-hidden aspect-video">
                  <img src={vehicle.images?.[0] || ''} alt={vehicle.name} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {#if vehicle.category}
                    <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-black" style="background: #F5C518">{vehicle.category}</span>
                  {/if}
                </div>
              </div>
              <div class="px-5 pb-5">
                <h3 class="font-bold text-white mb-2">{vehicle.name}</h3>
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-2xl font-black text-white">€{(vehicle.price_per_day ?? 0) * days}</span>
                    <span class="text-xs ml-1" style="color: #9ca3af">({days} dana × €{vehicle.price_per_day}/dan)</span>
                  </div>
                  <div class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-black" style="background: #F5C518">Odaberi</div>
                </div>
              </div>
            </button>
          {/each}
        </div>

        <button onclick={() => booking.update(b => ({ ...b, step: 1 }))} class="text-sm font-medium transition-colors hover:text-white" style="color: #9ca3af">
          ← Natrag
        </button>
      </div>
    {/if}

    <!-- Step 3: Driver -->
    {#if $booking.step === 3}
      <div class="p-2 rounded-[2rem]" style="border: 1px solid #2a2a2a; background: rgba(255,255,255,0.02)">
        <div class="p-8 rounded-[1.5rem]" style="background: #111">
          {#if $booking.selectedVehicle}
            <div class="flex items-center gap-4 mb-8 p-4 rounded-2xl" style="background: #1a1a1a; border: 1px solid #2a2a2a">
              <img src={$booking.selectedVehicle.images?.[0]} alt={$booking.selectedVehicle.name} class="w-20 h-14 object-cover rounded-xl" />
              <div>
                <p class="font-bold text-white">{$booking.selectedVehicle.name}</p>
                <p class="text-sm" style="color: #9ca3af">€{($booking.selectedVehicle.price_per_day ?? 0) * days} ukupno ({days} dana)</p>
              </div>
            </div>
          {/if}

          <h2 class="text-xl font-bold uppercase tracking-widest mb-8 text-white">Podaci vozača</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            {#each [
              { key: 'firstName', label: 'Ime', type: 'text' },
              { key: 'lastName', label: 'Prezime', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'phone', label: 'Telefon', type: 'tel' },
              { key: 'dateOfBirth', label: 'Datum rođenja', type: 'date' },
              { key: 'licenseNumber', label: 'Broj vozačke dozvole', type: 'text' },
              { key: 'licenseCountry', label: 'Zemlja vozačke dozvole', type: 'text' },
              { key: 'address', label: 'Adresa', type: 'text' },
              { key: 'city', label: 'Grad', type: 'text' },
              { key: 'zip', label: 'Poštanski broj', type: 'text' },
              { key: 'country', label: 'Država', type: 'text' },
            ] as field}
              <div class="space-y-2 {field.key === 'address' || field.key === 'email' ? 'md:col-span-2' : ''}">
                <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">{field.label}</label>
                <input
                  type={field.type}
                  class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all duration-200"
                  style="background: #1a1a1a; border: 1px solid #2a2a2a; color-scheme: dark"
                  bind:value={$booking.driverDetails[field.key as keyof typeof $booking.driverDetails]}
                />
              </div>
            {/each}
          </div>

          <div class="flex gap-4 mt-8">
            <button onclick={() => booking.update(b => ({ ...b, step: 2 }))} class="px-6 py-3 rounded-full text-sm font-bold transition-colors hover:bg-white/10" style="color: #9ca3af; border: 1px solid #2a2a2a">
              ← Natrag
            </button>
            <button
              onclick={() => booking.update(b => ({ ...b, step: 4 }))}
              class="flex-1 py-4 rounded-full font-black text-sm uppercase tracking-widest text-black transition-all duration-300 hover:brightness-110 active:scale-95"
              style="background: #F5C518"
            >
              Nastavi →
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Step 4: Review & Pay -->
    {#if $booking.step === 4}
      <div class="space-y-6">
        <!-- Summary -->
        <div class="p-2 rounded-[2rem]" style="border: 1px solid #2a2a2a; background: rgba(255,255,255,0.02)">
          <div class="p-8 rounded-[1.5rem]" style="background: #111">
            <h2 class="text-xl font-bold uppercase tracking-widest mb-6 text-white">Pregled rezervacije</h2>

            {#if $booking.selectedVehicle}
              <div class="flex items-center gap-4 mb-6 pb-6" style="border-bottom: 1px solid #1a1a1a">
                <img src={$booking.selectedVehicle.images?.[0]} alt={$booking.selectedVehicle.name} class="w-24 h-16 object-cover rounded-xl" />
                <div>
                  <p class="font-bold text-white text-lg">{$booking.selectedVehicle.name}</p>
                  <p class="text-sm" style="color: #9ca3af">{$booking.selectedVehicle.category}</p>
                </div>
              </div>
            {/if}

            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p class="text-xs uppercase tracking-widest mb-1" style="color: #9ca3af">Preuzimanje</p>
                <p class="text-sm text-white">{$booking.pickupDate} u {$booking.pickupTime}</p>
                <p class="text-sm font-medium" style="color: #F5C518">{$booking.pickupLocation}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-widest mb-1" style="color: #9ca3af">Povrat</p>
                <p class="text-sm text-white">{$booking.dropoffDate} u {$booking.dropoffTime}</p>
                <p class="text-sm font-medium" style="color: #F5C518">{$booking.dropoffLocation || $booking.pickupLocation}</p>
              </div>
            </div>

            <div class="space-y-2 mb-6 pb-6" style="border-bottom: 1px solid #1a1a1a">
              <div class="flex justify-between text-sm">
                <span style="color: #9ca3af">€{$booking.selectedVehicle?.price_per_day} × {days} {days === 1 ? 'dan' : 'dana'}</span>
                <span class="text-white">€{totalPrice}</span>
              </div>
              <div class="flex justify-between font-bold text-lg">
                <span class="text-white">Ukupno</span>
                <span style="color: #F5C518">€{totalPrice}</span>
              </div>
            </div>

            <div class="text-sm" style="color: #9ca3af">
              <p class="font-bold text-white mb-1">Vozač: {$booking.driverDetails.firstName} {$booking.driverDetails.lastName}</p>
              <p>{$booking.driverDetails.email} · {$booking.driverDetails.phone}</p>
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div class="p-2 rounded-[2rem]" style="border: 1px solid #2a2a2a; background: rgba(255,255,255,0.02)">
          <div class="p-8 rounded-[1.5rem]" style="background: #111">
            <h2 class="text-xl font-bold uppercase tracking-widest mb-6 text-white">Način plaćanja</h2>

            <div class="grid grid-cols-2 gap-4 mb-8">
              <button
                onclick={() => paymentMethod = 'stripe'}
                class="p-4 rounded-2xl text-center transition-all duration-200"
                style="background: #1a1a1a; border: 2px solid {paymentMethod === 'stripe' ? '#F5C518' : '#2a2a2a'}"
              >
                <p class="font-bold text-white text-sm">Kartica</p>
                <p class="text-xs mt-1" style="color: #9ca3af">Visa, Mastercard</p>
              </button>
              <button
                onclick={() => paymentMethod = 'paypal'}
                class="p-4 rounded-2xl text-center transition-all duration-200"
                style="background: #1a1a1a; border: 2px solid {paymentMethod === 'paypal' ? '#F5C518' : '#2a2a2a'}"
              >
                <p class="font-bold text-white text-sm">PayPal</p>
                <p class="text-xs mt-1" style="color: #9ca3af">PayPal račun</p>
              </button>
            </div>

            {#if paymentMethod === 'stripe'}
              <div class="p-4 rounded-xl mb-6" style="background: #1a1a1a; border: 1px solid #2a2a2a">
                <p class="text-sm text-center" style="color: #9ca3af">Stripe elementi će biti integrirani nakon postavljanja API ključeva.</p>
              </div>
            {:else}
              <div class="p-4 rounded-xl mb-6" style="background: #1a1a1a; border: 1px solid #2a2a2a">
                <p class="text-sm text-center" style="color: #9ca3af">PayPal gumb će biti prikazan nakon postavljanja PayPal Client ID-a.</p>
              </div>
            {/if}

            <div class="flex gap-4">
              <button onclick={() => booking.update(b => ({ ...b, step: 3 }))} class="px-6 py-3 rounded-full text-sm font-bold transition-colors hover:bg-white/10" style="color: #9ca3af; border: 1px solid #2a2a2a">
                ← Natrag
              </button>
              <button
                onclick={submitBooking}
                disabled={loading}
                class="flex-1 py-4 rounded-full font-black text-sm uppercase tracking-widest text-black transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-40"
                style="background: #F5C518"
              >
                {loading ? 'Obrađujem...' : `Potvrdi rezervaciju — €${totalPrice}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
