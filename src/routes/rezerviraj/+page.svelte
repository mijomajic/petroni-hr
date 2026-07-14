<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { booking, resetBooking } from '$lib/stores/booking';
  import { supabase } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import { calculatePricing, type PricingConfig, type PricingResult } from '$lib/pricing';
  import { isCroatianPublicHoliday, isSunday } from '$lib/holidays';
  import { renderTermsMarkup } from '$lib/terms-markup';
  import type {
    BookingExtra,
    Fee,
    RentalLocation,
    Season,
    SeasonPrice,
    Vehicle
  } from '$lib/supabase';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const rentalLocations: RentalLocation[] = $derived(data.locations as RentalLocation[]);
  const bookingExtras: BookingExtra[] = $derived(data.extras as BookingExtra[]);
  const rentalVehicles: Vehicle[] = $derived(data.vehicles as Vehicle[]);
  const pricingConfig: PricingConfig = $derived({
    seasons: data.seasons as Season[],
    seasonPrices: data.seasonPrices as SeasonPrice[],
    fees: data.fees as Fee[],
    locations: rentalLocations,
    extras: bookingExtras,
    kmPerDayIncluded: data.kmPerDayIncluded
  });
  const minDriverAge = $derived(Number(data.minDriverAge));
  const selectedPickupLocation = $derived(
    rentalLocations.find((location) => location.name === $booking.pickupLocation)
  );
  const selectedDropoffLocation = $derived(
    rentalLocations.find(
      (location) => location.name === ($booking.dropoffLocation || $booking.pickupLocation)
    )
  );
  let availableVehicles: Vehicle[] = $state([]);
  let loading = $state(false);
  let paymentMethod = $state<'bank_transfer' | 'corvuspay'>('bank_transfer');
  let paymentSplit = $state(false);
  let termsAccepted = $state(false);
  let termsOpen = $state(false);
  let termsScrolled = $state(false);
  let searchError = $state('');
  let availabilityLoadedFor = $state('');
  let driverError = $state('');
  let submitError = $state('');
  let openExtraInfo = $state<string | null>(null);
  let signedIn = $state(false);
  let authMode = $state<'guest' | 'login' | 'register'>('guest');
  let authEmail = $state('');
  let authPassword = $state('');
  let authFirstName = $state('');
  let authLastName = $state('');
  let authPhone = $state('');
  let authPasswordConfirm = $state('');
  let authError = $state('');
  let authMessage = $state('');
  let authLoading = $state(false);

  const timeOptions = Array.from({ length: 96 }, (_, index) => {
    const hours = Math.floor(index / 4).toString().padStart(2, '0');
    const minutes = ((index % 4) * 15).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  const steps = $derived($locale === 'hr'
    ? ['Datum i Vrijeme', 'Pretražite vozila', 'Detalji vozača', 'Pregled rezervacije']
    : ['Date & Time', 'Search vehicles', 'Driver details', 'Review booking']);

  function pricingFor(vehicle: Vehicle | null): PricingResult {
    return calculatePricing({
      vehicle,
      pickupDate: $booking.pickupDate,
      dropoffDate: $booking.dropoffDate,
      pickupTime: $booking.pickupTime,
      dropoffTime: $booking.dropoffTime,
      pickupLocation: $booking.pickupLocation,
      dropoffLocation: $booking.dropoffLocation,
      plannedKm: $booking.plannedKm,
      selectedExtras: $booking.extras,
      crossesBorder: $booking.crossesBorder,
      attendsFestival: $booking.attendsFestival
    }, pricingConfig);
  }

  const selectedPricing = $derived(pricingFor($booking.selectedVehicle));
  const days = $derived(selectedPricing.nights);
  const totalPrice = $derived(selectedPricing.payable_total);
  const vehiclePricing = $derived(
    new Map(availableVehicles.map((vehicle) => [vehicle.id, pricingFor(vehicle)]))
  );
  const activeTermsText = $derived(
    $locale === 'hr' ? data.terms?.content_hr : (data.terms?.content_en || data.terms?.content_hr)
  );
  const extraGroups = $derived(
    [
      { key: 'posebne_naknade', hr: 'Posebne naknade', en: 'Special fees' },
      { key: 'depozit', hr: 'Povratni depoziti', en: 'Refundable deposits' },
      { key: 'oprema', hr: 'Dodatna oprema', en: 'Equipment' },
      { key: 'ciscenje', hr: 'Čišćenje', en: 'Cleaning' },
      { key: 'ostalo', hr: 'Ostalo', en: 'Other' }
    ]
      .map((group) => ({
        ...group,
        extras: bookingExtras.filter((extra) => (extra.category ?? 'ostalo') === group.key)
      }))
      .filter((group) => group.extras.length > 0)
  );

  const canSearch = $derived(
    Boolean(
      $booking.pickupLocation &&
      $booking.pickupDate &&
      $booking.dropoffDate &&
      $booking.dropoffDate > $booking.pickupDate &&
      $booking.numAdults >= 1 &&
      $booking.plannedKm > 0 &&
      $booking.destination.trim()
    )
  );

  const maxDriverDob = $derived.by(() => {
    const reference = $booking.pickupDate
      ? new Date(`${$booking.pickupDate}T00:00:00Z`)
      : new Date();
    reference.setUTCFullYear(reference.getUTCFullYear() - minDriverAge);
    return reference.toISOString().slice(0, 10);
  });

  function isDriverOldEnough(dateOfBirth: string): boolean {
    return Boolean(dateOfBirth && dateOfBirth <= maxDriverDob);
  }

  function formatDate(value: string): string {
    return new Intl.DateTimeFormat($locale === 'hr' ? 'hr-HR' : 'en-GB').format(
      new Date(`${value}T00:00:00Z`)
    );
  }

  function formatMoney(value: number): string {
    return new Intl.NumberFormat($locale === 'hr' ? 'hr-HR' : 'en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  function locationOptionLabel(location: RentalLocation): string {
    const suffix = Number(location.location_fee) > 0
      ? `+${formatMoney(Number(location.location_fee))}`
      : 'Free';
    return `${location.name} — ${suffix}`;
  }

  function scheduleStatus(
    location: RentalLocation | undefined,
    date: string,
    time: string,
    window: string | null | undefined
  ): { label: string; detail: string; charged: boolean } | null {
    if (!location) return null;
    const afterHoursFee = pricingConfig.fees.find((fee) => fee.key === 'after_hours' && fee.is_active);
    const sundayHolidayFee = pricingConfig.fees.find((fee) => fee.key === 'sunday_holiday' && fee.is_active);
    const outsideWindow = Boolean(window && time && (time < window.split('-')[0].trim() || time > window.split('-')[1].trim()));
    const sundayOrHoliday = Boolean(date && (isSunday(date) || isCroatianPublicHoliday(date)));
    const charges = [
      outsideWindow && afterHoursFee ? Number(afterHoursFee.amount) : 0,
      sundayOrHoliday && sundayHolidayFee ? Number(sundayHolidayFee.amount) : 0
    ].filter(Boolean);
    const amount = charges.reduce((total, charge) => total + charge, 0);
    if (!amount) {
      return {
        label: 'Free',
        detail: window
          ? ($locale === 'hr' ? `Unutar radnog vremena (${window})` : `Within working hours (${window})`)
          : ($locale === 'hr' ? 'Bez dodatne naknade za termin' : 'No time surcharge'),
        charged: false
      };
    }
    const reasons = [
      outsideWindow ? ($locale === 'hr' ? 'izvan radnog vremena' : 'outside working hours') : '',
      sundayOrHoliday ? ($locale === 'hr' ? 'nedjelja/blagdan' : 'Sunday/holiday') : ''
    ].filter(Boolean).join(' · ');
    return { label: `+${formatMoney(amount)}`, detail: reasons, charged: true };
  }

  const pickupScheduleStatus = $derived(scheduleStatus(
    selectedPickupLocation,
    $booking.pickupDate,
    $booking.pickupTime,
    selectedPickupLocation?.pickup_window
  ));
  const dropoffScheduleStatus = $derived(scheduleStatus(
    selectedDropoffLocation,
    $booking.dropoffDate,
    $booking.dropoffTime,
    selectedDropoffLocation?.return_window
  ));

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

  function vehicleCapacityMatches(vehicle: Vehicle): boolean {
    const seats = vehicle.seats ?? vehicle.max_adults ?? 0;
    const adultsFit = (vehicle.max_adults ?? seats) >= $booking.numAdults;
    const childrenFit = (vehicle.max_children ?? seats) >= $booking.numChildren;
    return seats >= $booking.numAdults + $booking.numChildren && adultsFit && childrenFit;
  }

  function searchSignature() {
    return [
      $booking.pickupLocation,
      $booking.dropoffLocation || $booking.pickupLocation,
      $booking.pickupDate,
      $booking.dropoffDate,
      $booking.numAdults,
      $booking.numChildren
    ].join('|');
  }

  function goToStep(step: number) {
    booking.update((current) => ({ ...current, step }));
    if (step === 2 && canSearch) void refreshAvailability({ keepStep: true });
  }

  function handleTermsScroll(event: Event) {
    const element = event.currentTarget as HTMLElement;
    termsScrolled = element.scrollTop + element.clientHeight >= element.scrollHeight - 8;
  }

  function openTerms() {
    termsOpen = true;
    termsScrolled = false;
    void tick().then(() => {
      const element = document.getElementById('rental-terms-scroll');
      if (element && element.scrollHeight <= element.clientHeight + 8) termsScrolled = true;
    });
  }

  async function refreshAvailability(options: { keepStep?: boolean } = {}) {
    loading = true;
    searchError = '';
    const capacityMatches = rentalVehicles.filter(vehicleCapacityMatches);
    const signature = searchSignature();

    if (capacityMatches.length === 0) {
      availableVehicles = [];
      availabilityLoadedFor = signature;
      booking.update((current) => ({
        ...current,
        selectedVehicle: null,
        extras: {},
        step: current.step > 1 ? 2 : current.step
      }));
      searchError = $locale === 'hr'
        ? 'Nema vozila za odabrani broj putnika.'
        : 'No vehicles match the selected number of passengers.';
      loading = false;
      return;
    }

    try {
      const params = new URLSearchParams({
        vehicleIds: capacityMatches.map((vehicle) => vehicle.id).join(','),
        pickupDate: $booking.pickupDate,
        dropoffDate: $booking.dropoffDate
      });
      const response = await fetch(`/api/booking/availability?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const unavailable = new Set<string>(result.unavailableVehicleIds ?? []);
      availableVehicles = capacityMatches.filter((vehicle) => !unavailable.has(vehicle.id));
      availabilityLoadedFor = signature;
      if (availableVehicles.length === 0) {
        searchError = $locale === 'hr'
          ? 'Nema slobodnih vozila za odabrane datume.'
          : 'No vehicles are available for the selected dates.';
      }
      if (
        $booking.selectedVehicle &&
        !availableVehicles.some((vehicle) => vehicle.id === $booking.selectedVehicle?.id)
      ) {
        booking.update((current) => ({
          ...current,
          selectedVehicle: null,
          extras: {},
          step: current.step > 2 ? 2 : current.step
        }));
      }
    } catch {
      availableVehicles = [];
      availabilityLoadedFor = '';
      searchError = $locale === 'hr'
        ? 'Dostupnost trenutačno nije moguće provjeriti. Pokušajte ponovno.'
        : 'Availability could not be checked. Please try again.';
      if (options.keepStep) booking.update((current) => ({ ...current, step: current.step > 2 ? 2 : current.step }));
    }
    if (!options.keepStep) booking.update(b => ({ ...b, step: 2 }));
    loading = false;
  }

  async function searchVehicles() {
    await refreshAvailability();
  }

  function selectionStillAvailable() {
    return Boolean(
      $booking.selectedVehicle &&
        availabilityLoadedFor === searchSignature() &&
        availableVehicles.some((vehicle) => vehicle.id === $booking.selectedVehicle?.id)
    );
  }

  function continueToDriver() {
    if (!selectionStillAvailable()) {
      searchError = $locale === 'hr'
        ? 'Ponovno provjerite dostupnost i odaberite vozilo.'
        : 'Check availability again and select a vehicle.';
      void refreshAvailability({ keepStep: true });
      return;
    }
    goToStep(3);
  }

  function continueToReview() {
    if (!selectionStillAvailable()) {
      driverError = $locale === 'hr'
        ? 'Odabrano vozilo treba ponovno provjeriti. Vratite se na odabir vozila.'
        : 'The selected vehicle needs to be checked again. Go back to vehicle selection.';
      goToStep(2);
      return;
    }
    const details = $booking.driverDetails;
    if (
      !details.firstName.trim() ||
      !details.lastName.trim() ||
      !details.email.trim() ||
      !details.phone.trim() ||
      !details.dateOfBirth ||
      !details.licenseNumber.trim() ||
      !details.licenseCountry.trim() ||
      !details.address.trim() ||
      !details.city.trim() ||
      !details.zip.trim() ||
      !details.country.trim()
    ) {
      driverError = $locale === 'hr'
        ? 'Ispunite sva obavezna polja vozača.'
        : 'Complete all required driver fields.';
      return;
    }
    if (!isDriverOldEnough(details.dateOfBirth)) {
      driverError = $locale === 'hr'
        ? `Vozač na dan preuzimanja mora imati najmanje ${minDriverAge} godina.`
        : `The driver must be at least ${minDriverAge} years old on pickup.`;
      return;
    }
    driverError = '';
    booking.update((current) => ({ ...current, step: 4, totalPrice }));
  }

  async function submitBooking() {
    if (!$booking.selectedVehicle) return;
    if (!selectionStillAvailable()) {
      submitError = $locale === 'hr'
        ? 'Odabrano vozilo više nije potvrđeno kao dostupno. Vratite se na odabir vozila.'
        : 'The selected vehicle is no longer confirmed as available. Return to vehicle selection.';
      goToStep(2);
      return;
    }
    if (!termsAccepted) {
      submitError = $locale === 'hr' ? 'Prihvatite uvjete najma prije slanja.' : 'Accept the rental terms before submitting.';
      return;
    }
    loading = true;
    submitError = '';
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...$booking,
          pricing: selectedPricing,
          total_price: totalPrice,
          payment_method: paymentMethod,
          payment_split: paymentSplit,
          terms_accepted: termsAccepted
        }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('petroni_booking_result', JSON.stringify(data));
        resetBooking();
        if (data.corvuspay) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.corvuspay.url;
          for (const [name, value] of Object.entries(data.corvuspay.fields)) {
            const input = document.createElement('input');
            input.type = 'hidden'; input.name = name; input.value = String(value);
            form.appendChild(input);
          }
          document.body.appendChild(form);
          form.submit();
        } else {
          window.location.href = '/rezerviraj/success';
        }
      }
      else {
        submitError = data.error || ($locale === 'hr'
          ? 'Rezervaciju nije moguće spremiti. Pokušajte ponovno.'
          : 'The booking could not be saved. Please try again.');
      }
    } catch {
      submitError = $locale === 'hr'
        ? 'Rezervaciju nije moguće spremiti. Provjerite vezu i pokušajte ponovno.'
        : 'The booking could not be saved. Check your connection and try again.';
    } finally { loading = false; }
  }

  function prefillProfile(profile: Record<string, unknown>) {
    booking.update((current) => ({
      ...current,
      driverDetails: {
        ...current.driverDetails,
        firstName: String(profile.first_name ?? current.driverDetails.firstName),
        lastName: String(profile.last_name ?? current.driverDetails.lastName),
        email: String(profile.email ?? current.driverDetails.email),
        phone: String(profile.phone ?? current.driverDetails.phone),
        address: String(profile.address ?? current.driverDetails.address),
        city: String(profile.city ?? current.driverDetails.city),
        zip: String(profile.zip ?? current.driverDetails.zip),
        country: String(profile.country ?? current.driverDetails.country)
      }
    }));
  }

  function sanitizeStoredBooking() {
    const validVehicleIds = new Set(rentalVehicles.map((vehicle) => vehicle.id));
    const extrasById = new Map(bookingExtras.map((extra) => [extra.id, extra]));

    booking.update((current) => {
      const selectedVehicle = current.selectedVehicle?.id
        ? rentalVehicles.find((vehicle) => vehicle.id === current.selectedVehicle?.id) ?? null
        : null;
      const extras = Object.fromEntries(
        Object.entries(current.extras)
          .filter(([id]) => extrasById.has(id))
          .map(([id, qty]) => {
            const extra = extrasById.get(id);
            return [id, Math.max(0, Math.min(extra?.max_qty ?? 0, Math.floor(Number(qty) || 0)))];
          })
      );
      const selectedVehicleIsStale = current.selectedVehicle && !validVehicleIds.has(current.selectedVehicle.id);

      return {
        ...current,
        selectedVehicle,
        extras,
        step: selectedVehicleIsStale && current.step > 1 ? 1 : current.step
      };
    });
  }

  async function authenticateDuringBooking() {
    if (authMode === 'guest') return;
    authLoading = true;
    authError = '';
    authMessage = '';

    if (authMode === 'login') {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error || !authData.user) {
        authError = 'Prijava nije uspjela. Provjerite email adresu i lozinku.';
      } else {
        signedIn = true;
        prefillProfile({ ...authData.user.user_metadata, email: authData.user.email ?? '' });
        authMessage = 'Prijavljeni ste. Podaci vozača su popunjeni iz Vašeg profila.';
      }
    } else {
      if (
        !authFirstName.trim() ||
        !authLastName.trim() ||
        !authEmail.trim() ||
        !authPhone.trim() ||
        authPassword.length < 8 ||
        !authPasswordConfirm
      ) {
        authError = 'Ispunite sva obavezna polja. Lozinka mora imati najmanje 8 znakova.';
        authLoading = false;
        return;
      }
      if (authPassword !== authPasswordConfirm) {
        authError = 'Lozinke se ne podudaraju.';
        authLoading = false;
        return;
      }
      const { data: authData, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/rezerviraj`,
          data: {
            first_name: authFirstName.trim(),
            last_name: authLastName.trim(),
            full_name: `${authFirstName.trim()} ${authLastName.trim()}`,
            phone: authPhone.trim(),
            address: '',
            city: '',
            zip: '',
            country: 'Hrvatska'
          }
        }
      });
      if (error) {
        authError = 'Registracija nije uspjela. Možda račun s ovom adresom već postoji.';
      } else if (authData.session && authData.user) {
        signedIn = true;
        prefillProfile({ ...authData.user.user_metadata, email: authData.user.email ?? '' });
        authMessage = 'Račun je izrađen i podaci vozača su popunjeni.';
      } else {
        authMessage = 'Provjerite email i potvrdite račun. Rezervaciju možete nastaviti kao gost.';
      }
    }

    authLoading = false;
  }

  onMount(() => {
    sanitizeStoredBooking();
    if ($booking.step >= 2 && canSearch) void refreshAvailability({ keepStep: true });
    if (data.profile) {
      signedIn = true;
      authEmail = String(data.profile.email ?? '');
      prefillProfile(data.profile);
    }
  });

  const driverFields = $derived($locale === 'hr' ? [
    { key: 'firstName', label: 'Ime *', type: 'text' }, { key: 'lastName', label: 'Prezime *', type: 'text' },
    { key: 'email', label: 'Email *', type: 'email' }, { key: 'phone', label: 'Telefon *', type: 'tel' },
    { key: 'dateOfBirth', label: `Datum rođenja * (minimalno ${minDriverAge} godina)`, type: 'date' }, { key: 'licenseNumber', label: 'Broj vozačke dozvole *', type: 'text' },
    { key: 'licenseCountry', label: 'Zemlja vozačke *', type: 'text' }, { key: 'address', label: 'Adresa *', type: 'text' },
    { key: 'city', label: 'Grad *', type: 'text' }, { key: 'zip', label: 'Poštanski broj *', type: 'text' }, { key: 'country', label: 'Država *', type: 'text' },
  ] : [
    { key: 'firstName', label: 'First name *', type: 'text' }, { key: 'lastName', label: 'Last name *', type: 'text' },
    { key: 'email', label: 'Email *', type: 'email' }, { key: 'phone', label: 'Phone *', type: 'tel' },
    { key: 'dateOfBirth', label: `Date of birth * (minimum age ${minDriverAge})`, type: 'date' }, { key: 'licenseNumber', label: 'License number *', type: 'text' },
    { key: 'licenseCountry', label: 'License country *', type: 'text' }, { key: 'address', label: 'Address *', type: 'text' },
    { key: 'city', label: 'City *', type: 'text' }, { key: 'zip', label: 'ZIP *', type: 'text' }, { key: 'country', label: 'Country *', type: 'text' },
  ]);
</script>

<svelte:head>
  <title>Rezervacija najma kampera u Hrvatskoj | Petroni</title>
  <meta name="description" content="Online rezervacija Petroni kampera: odaberite lokaciju, datume, vozilo, dodatnu opremu i način plaćanja u nekoliko koraka." />
  <meta property="og:title" content="Rezervacija najma kampera u Hrvatskoj | Petroni" />
  <meta property="og:description" content="Online rezervacija Petroni kampera: odaberite lokaciju, datume, vozilo, dodatnu opremu i način plaćanja u nekoliko koraka." />
</svelte:head>

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
      <div class="max-w-4xl mx-auto">
        <div class="card p-6 md:p-8">
          <!-- Pickup -->
          <div class="mb-8">
            <span class="inline-block px-4 py-1.5 rounded-t-md text-[11px] font-bold uppercase tracking-wide text-white" style="background:#f5c518">{$locale === 'hr' ? 'Preuzimanje' : 'Pickup'}</span>
            <div class="border-t-2 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5" style="border-color:#f5c518">
              <div class="md:col-span-2">
                <span class="field-label">{$locale === 'hr' ? 'Mjesto preuzimanja vozila' : 'Pickup location'}</span>
                <select class="field" bind:value={$booking.pickupLocation}>
                  <option value="">{$locale === 'hr' ? 'Odaberite lokaciju' : 'Select location'}</option>
                  {#each rentalLocations as loc}<option value={loc.name}>{locationOptionLabel(loc)}</option>{/each}
                </select>
              </div>
              <div><span class="field-label">{$locale === 'hr' ? 'Datum preuzimanja' : 'Pickup date'}</span><input type="date" class="field" min={new Date().toISOString().split('T')[0]} bind:value={$booking.pickupDate} /></div>
              <div>
                <label class="field-label" for="pickup_time">{$locale === 'hr' ? 'Vrijeme preuzimanja' : 'Pickup time'}</label>
                <div class="flex gap-2"><select id="pickup_time" class="field" bind:value={$booking.pickupTime}>{#each timeOptions as time}<option value={time}>{time}</option>{/each}</select>
                  {#if pickupScheduleStatus}<span class="shrink-0 self-center rounded-md px-3 py-2 text-xs font-bold" style={pickupScheduleStatus.charged ? 'background:#fff0ef;color:#b42318' : 'background:#e9f9ef;color:#167a3a'}>{pickupScheduleStatus.label}</span>{/if}
                </div>
                {#if pickupScheduleStatus}<p class="mt-1 text-xs text-[#7a7f86]">{pickupScheduleStatus.detail}</p>{/if}
              </div>
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
                  {#each rentalLocations as loc}<option value={loc.name}>{locationOptionLabel(loc)}</option>{/each}
                </select>
              </div>
              <div><span class="field-label">{$locale === 'hr' ? 'Datum povratka' : 'Return date'}</span><input type="date" class="field" min={$booking.pickupDate || new Date().toISOString().split('T')[0]} bind:value={$booking.dropoffDate} /></div>
              <div>
                <label class="field-label" for="dropoff_time">{$locale === 'hr' ? 'Vrijeme povratka' : 'Return time'}</label>
                <div class="flex gap-2"><select id="dropoff_time" class="field" bind:value={$booking.dropoffTime}>{#each timeOptions as time}<option value={time}>{time}</option>{/each}</select>
                  {#if dropoffScheduleStatus}<span class="shrink-0 self-center rounded-md px-3 py-2 text-xs font-bold" style={dropoffScheduleStatus.charged ? 'background:#fff0ef;color:#b42318' : 'background:#e9f9ef;color:#167a3a'}>{dropoffScheduleStatus.label}</span>{/if}
                </div>
                {#if dropoffScheduleStatus}<p class="mt-1 text-xs text-[#7a7f86]">{dropoffScheduleStatus.detail}</p>{/if}
              </div>
            </div>
          </div>

          <!-- Travellers and trip plan -->
          <div class="mb-8">
            <span class="inline-block px-4 py-1.5 rounded-t-md text-[11px] font-bold uppercase tracking-wide text-white" style="background:#f5c518">{$locale === 'hr' ? 'Putnici i plan puta' : 'Travellers and trip plan'}</span>
            <div class="border-t-2 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5" style="border-color:#f5c518">
              <div>
                <span class="field-label">{$locale === 'hr' ? 'Broj odraslih' : 'Adults'}</span>
                <input type="number" min="1" max="10" class="field" bind:value={$booking.numAdults} />
              </div>
              <div>
                <span class="field-label">{$locale === 'hr' ? 'Broj djece' : 'Children'}</span>
                <input type="number" min="0" max="10" class="field" bind:value={$booking.numChildren} />
              </div>
              <div>
                <span class="field-label">{$locale === 'hr' ? 'Planirani kilometri' : 'Planned kilometres'}</span>
                <input type="number" min="1" step="50" class="field" placeholder="npr. 1200" bind:value={$booking.plannedKm} />
              </div>
              <div>
                <span class="field-label">{$locale === 'hr' ? 'Odredište / plan puta' : 'Destination / route'}</span>
                <input type="text" class="field" placeholder={$locale === 'hr' ? 'npr. Istra i Kvarner' : 'e.g. Istria and Kvarner'} bind:value={$booking.destination} />
              </div>
              <label class="flex items-start gap-3 rounded-md border border-[#e2e4e8] p-3 text-sm text-[#4c5157]">
                <input type="checkbox" class="mt-1 h-4 w-4 accent-[#f5c518]" bind:checked={$booking.crossesBorder} />
                <span><b class="text-[#2b2b2b]">{$locale === 'hr' ? 'Planiram prelazak granice' : 'I plan to cross a border'}</b><br />{$locale === 'hr' ? 'Naknada za prelazak granice automatski se dodaje u obračun.' : 'The border-crossing fee is automatically added to the quote.'}</span>
              </label>
              <label class="flex items-start gap-3 rounded-md border border-[#e2e4e8] p-3 text-sm text-[#4c5157]">
                <input type="checkbox" class="mt-1 h-4 w-4 accent-[#f5c518]" bind:checked={$booking.attendsFestival} />
                <span><b class="text-[#2b2b2b]">{$locale === 'hr' ? 'Putujem na festival' : 'I am travelling to a festival'}</b><br />{$locale === 'hr' ? 'Naknada za festival automatski se dodaje u obračun.' : 'The festival fee is automatically added to the quote.'}</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end">
            <button onclick={searchVehicles} disabled={!canSearch || loading} class="btn btn-primary px-8 py-3.5 disabled:opacity-50">
              {loading ? ($locale === 'hr' ? 'Učitavanje…' : 'Loading…') : ($locale === 'hr' ? 'Pretražite vozila' : 'Search vehicles')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Step 2 -->
    {#if $booking.step === 2}
      <div class="max-w-6xl mx-auto space-y-6">
        {#if days > 0}
          <div class="card p-4 flex items-center gap-3 text-sm" style="background:#fffaf0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="text-[#6b7178]"><b class="text-[#2b2b2b]">{$booking.pickupDate}</b> → <b class="text-[#2b2b2b]">{$booking.dropoffDate}</b> <span style="color:#b5890a" class="font-semibold">({days} {$locale === 'hr' ? (days === 1 ? 'dan' : 'dana') : 'days'})</span></span>
          </div>
        {/if}
        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <!-- Vehicles: single column -->
          <div class="flex flex-col gap-4">
            {#each availableVehicles as vehicle}
              {@const price = vehiclePricing.get(vehicle.id)}
              <button onclick={() => selectVehicle(vehicle)} class="card text-left overflow-hidden flex flex-row" style="border-color:{$booking.selectedVehicle?.id === vehicle.id ? '#f5c518' : '#ededf0'}">
                <div class="w-40 sm:w-56 flex-shrink-0 overflow-hidden bg-[#f3f4f6]"><img src={vehicle.images?.[0]} alt={vehicle.name} class="w-full h-full object-cover" /></div>
                <div class="p-5 flex-1 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_190px] items-center gap-4">
                  <div>
                    <h3 class="font-semibold text-[#2b2b2b] mb-1">{vehicle.name}</h3>
                    <p class="flex flex-wrap items-center gap-2 text-xs text-[#8b9099]">
                      <span class="inline-flex rounded-full border border-[#e2e4e8] bg-[#f8f9fa] px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-[#5b6168]">{vehicle.category}</span>
                      <span>{vehicle.seats} {$locale === 'hr' ? 'sjedala' : 'seats'}</span>
                    </p>
                  </div>
                  <div class="flex flex-col items-stretch gap-2">
                    <span class="block whitespace-nowrap text-xl font-bold tabular-nums text-[#2b2b2b] sm:text-right">{formatMoney(price?.payable_total ?? 0)}</span>
                    {#if price?.season_names?.length}
                      <div class="flex flex-wrap gap-1.5 sm:justify-end" aria-label={$locale === 'hr' ? 'Primijenjene sezone' : 'Applied seasons'}>
                        {#each price.season_names as season}
                          <span class="inline-flex max-w-full rounded-full border border-[#e2e4e8] bg-[#f8f9fa] px-2.5 py-1 text-[10px] font-semibold leading-snug text-[#68707a]">{season}</span>
                        {/each}
                      </div>
                    {:else}
                      <span class="text-xs text-[#9aa0a8] sm:text-right">{$locale === 'hr' ? 'Osnovna cijena' : 'Base price'}</span>
                    {/if}
                    {#if price?.min_nights_applied}
                      <span class="text-[10px] font-semibold sm:text-right" style="color:#b5890a">{price.billable_nights} {$locale === 'hr' ? 'obračunatih noćenja' : 'billable nights'}</span>
                    {/if}
                    <span class="btn btn-primary w-full px-4 py-2.5 text-[11px]">{$locale === 'hr' ? 'Odaberi' : 'Select'}</span>
                  </div>
                </div>
              </button>
            {:else}
              <div class="card card-static p-8 text-center">
                <p class="font-semibold text-[#2b2b2b]">{searchError || ($locale === 'hr' ? 'Nema dostupnih vozila.' : 'No vehicles available.')}</p>
                <button onclick={() => goToStep(1)} class="btn btn-ghost mt-5">{$locale === 'hr' ? 'Promijeni pretragu' : 'Change search'}</button>
              </div>
            {/each}
          </div>

          <!-- Extras + summary: right column -->
          <div class="grid gap-6 lg:sticky lg:top-24 h-fit">
            <div class="card p-6 max-h-[38rem] overflow-hidden flex flex-col">
              <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Dodatna oprema' : 'Extras'}</h2>
              {#if !$booking.selectedVehicle}
                <p class="text-sm text-[#9aa0a8]">{$locale === 'hr' ? 'Odaberite vozilo za prikaz dodatne opreme.' : 'Select a vehicle to view extras.'}</p>
              {:else}
                <div class="space-y-4 overflow-y-auto pr-2 -mr-2">
                  {#each extraGroups as group}
                    <section>
                      <h3 class="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b9099] mb-2">{$locale === 'hr' ? group.hr : group.en}</h3>
                      <div class="divide-y divide-[#ededf0]">
                        {#each group.extras as extra}
                          {@const autoApplied =
                            (extra.auto_apply_rule === 'border_crossing' && $booking.crossesBorder) ||
                            (extra.auto_apply_rule === 'festival' && $booking.attendsFestival)}
                          {@const qty = extra.is_required || autoApplied ? Math.max(1, $booking.extras[extra.id] ?? 0) : ($booking.extras[extra.id] ?? 0)}
                          <div class="grid gap-2 py-2.5">
                            <div class="flex items-start gap-2">
                              <span class="text-[13px] leading-snug font-medium text-[#2b2b2b] flex-1">{$locale === 'hr' ? extra.name_hr : (extra.name_en || extra.name_hr)}</span>
                              <button
                                type="button"
                                class="w-5 h-5 flex-shrink-0 rounded-full text-[12px] font-bold cursor-help"
                                style="background:#f3f4f6;color:#6b7178"
                                title={extra.description_hr ?? ''}
                                aria-label={$locale === 'hr' ? `Informacije: ${extra.name_hr}` : `Information: ${extra.name_en || extra.name_hr}`}
                                aria-expanded={openExtraInfo === extra.id}
                                onclick={() => openExtraInfo = openExtraInfo === extra.id ? null : extra.id}
                              >ⓘ</button>
                              {#if extra.is_required}
                                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style="background:#fff7e0;color:#b5890a">{$locale === 'hr' ? 'Obavezno' : 'Required'}</span>
                              {:else if autoApplied}
                                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style="background:#e9f9ef;color:#167a3a">{$locale === 'hr' ? 'Automatski dodano' : 'Automatically added'}</span>
                              {/if}
                            </div>
                            {#if openExtraInfo === extra.id}
                              <p class="text-xs leading-relaxed text-[#7a7f86] p-3 rounded-md" style="background:#f6f7f9">{extra.description_hr}</p>
                            {/if}
                            <div class="flex items-center justify-between">
                              <span class="text-[13px] text-[#7a7f86]">
                                {formatMoney(extra.price)}
                                {#if extra.price_type === 'per_day'}<span class="text-xs">/{$locale === 'hr' ? 'dan' : 'day'}</span>{/if}
                              </span>
                              {#if autoApplied}
                                <span class="text-[11px] font-bold uppercase" style="color:#167a3a">{$locale === 'hr' ? 'Uključeno' : 'Included'}</span>
                              {:else if extra.max_qty > 1}
                                <div class="flex items-center rounded-md overflow-hidden border border-[#e2e4e8]">
                                  <button onclick={() => setExtraQty(extra.id, qty - 1, extra.max_qty)} disabled={extra.is_required} class="px-3 py-1.5 font-bold cursor-pointer text-[#2b2b2b] hover:bg-[#f6f7f9] disabled:cursor-not-allowed disabled:opacity-40">−</button>
                                  <span class="px-3 text-sm font-semibold text-[#2b2b2b]">{qty}</span>
                                  <button onclick={() => setExtraQty(extra.id, qty + 1, extra.max_qty)} disabled={extra.is_required} class="px-3 py-1.5 font-bold cursor-pointer text-[#2b2b2b] hover:bg-[#f6f7f9] disabled:cursor-not-allowed disabled:opacity-40">+</button>
                                </div>
                              {:else}
                                <button onclick={() => setExtraQty(extra.id, qty > 0 ? 0 : 1, extra.max_qty)} disabled={extra.is_required}
                                  class="px-4 py-1.5 rounded-md text-[11px] font-bold uppercase cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                  style="{qty > 0 ? 'background:#f5c518;color:#fff' : 'background:#f6f7f9;color:#5b6168'}">
                                  {qty > 0 ? ($locale === 'hr' ? 'Odabrano' : 'Selected') : ($locale === 'hr' ? 'Dodaj' : 'Add')}
                                </button>
                              {/if}
                            </div>
                          </div>
                        {/each}
                      </div>
                    </section>
                  {/each}
                </div>
              {/if}
            </div>

            {#if $booking.selectedVehicle}
              <div class="card p-6">
                <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Sažetak' : 'Summary'}</h2>
                {#if selectedPricing.season_names.length}
                  <div class="mb-4">
                    <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b9099]">{$locale === 'hr' ? 'Primijenjene sezone' : 'Applied seasons'}</p>
                    <div class="flex flex-wrap gap-1.5">
                      {#each selectedPricing.season_names as season}
                        <span class="inline-flex rounded-full border border-[#e2e4e8] bg-[#f8f9fa] px-2.5 py-1 text-[10px] font-semibold leading-snug text-[#68707a]">{season}</span>
                      {/each}
                    </div>
                  </div>
                {/if}
                {#if selectedPricing.min_nights_note}
                  <p class="text-xs leading-relaxed p-3 rounded-md mb-4" style="background:#fff7e0;color:#8a6500">{selectedPricing.min_nights_note}</p>
                {/if}
                <div class="space-y-2 mb-4">
                  {#each selectedPricing.line_items as item}
                    <div class="flex justify-between gap-4 text-sm">
                      <span class="text-[#7a7f86] leading-snug">{item.label}</span>
                      <span class="text-[#2b2b2b] whitespace-nowrap">{formatMoney(item.amount)}</span>
                    </div>
                  {/each}
                </div>
                {#if selectedPricing.refundable_deposit > 0}
                  <div class="flex justify-between gap-4 text-sm py-3 border-t border-[#ededf0]">
                    <span class="text-[#7a7f86]">{$locale === 'hr' ? 'Povratni polog (ne plaća se sada)' : 'Refundable deposit (not charged now)'}</span>
                    <span class="font-semibold whitespace-nowrap text-[#2b2b2b]">{formatMoney(selectedPricing.refundable_deposit)}</span>
                  </div>
                {/if}
                {#if selectedPricing.extra_km_note}
                  <p class="text-xs leading-relaxed p-3 rounded-md mb-4" style="background:#f6f7f9;color:#6b7178">{selectedPricing.extra_km_note}</p>
                {/if}
                <div class="pt-3 flex justify-between font-bold text-lg border-t border-[#ededf0] mb-5">
                  <span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Za plaćanje' : 'Payable total'}</span>
                  <span style="color:#b5890a">{formatMoney(totalPrice)}</span>
                </div>
                <button onclick={continueToDriver} class="btn btn-primary w-full">{$locale === 'hr' ? 'Nastavi' : 'Continue'} →</button>
              </div>
            {/if}
          </div>
        </div>

        <button onclick={() => goToStep(1)} class="text-sm text-[#7a7f86] hover:text-[#2b2b2b]">← {$locale === 'hr' ? 'Natrag' : 'Back'}</button>
      </div>
    {/if}

    <!-- Step 3 -->
    {#if $booking.step === 3}
      <div class="card p-6 md:p-8 max-w-4xl mx-auto">
        {#if $booking.selectedVehicle}
          <div class="flex items-center gap-4 mb-7 p-4 rounded-md bg-[#f6f7f9]">
            <img src={$booking.selectedVehicle.images?.[0]} alt="" class="w-20 h-14 object-cover rounded-md" />
            <div><p class="font-semibold text-[#2b2b2b]">{$booking.selectedVehicle.name}</p><p class="text-sm text-[#7a7f86]">{formatMoney(totalPrice)} {$locale === 'hr' ? 'ukupno' : 'total'} ({days} {$locale === 'hr' ? 'dana' : 'days'})</p></div>
          </div>
        {/if}
        <div class="rounded-lg p-5 mb-7 border border-[#e2e4e8]" style="background:#fafbfc">
          {#if signedIn}
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0" style="background:#fff7d6;color:#8a6500">✓</div>
              <div>
                <p class="font-semibold text-[#2b2b2b]">Prijavljeni ste</p>
                <p class="text-sm text-[#7a7f86] mt-1">Podaci iz Vašeg profila automatski su popunjeni. Svejedno ih možete urediti za ovu rezervaciju.</p>
              </div>
            </div>
          {:else}
            <div class="mb-5">
              <p class="font-semibold text-[#2b2b2b]">{$locale === 'hr' ? 'Želite li rezervirati s računom?' : 'Would you like to book with an account?'}</p>
              <p class="text-sm text-[#7a7f86] mt-1">{$locale === 'hr' ? 'Račun nije obavezan. Možete odmah nastaviti kao gost ili se prijaviti za brže popunjavanje podataka.' : 'An account is optional. Continue as a guest now, or sign in to prefill your details.'}</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
              <button type="button" onclick={() => { authMode = 'guest'; authError = ''; authMessage = ''; }} class="btn text-[11px]" class:btn-primary={authMode === 'guest'} class:btn-ghost={authMode !== 'guest'}>{$locale === 'hr' ? 'Nastavi kao gost' : 'Continue as guest'}</button>
              <button type="button" onclick={() => { authMode = 'login'; authError = ''; authMessage = ''; }} class="btn text-[11px]" class:btn-primary={authMode === 'login'} class:btn-ghost={authMode !== 'login'}>{$locale === 'hr' ? 'Imam račun' : 'I have an account'}</button>
              <button type="button" onclick={() => { authMode = 'register'; authError = ''; authMessage = ''; }} class="btn text-[11px]" class:btn-primary={authMode === 'register'} class:btn-ghost={authMode !== 'register'}>{$locale === 'hr' ? 'Izradi račun' : 'Create account'}</button>
            </div>
            {#if authMode === 'guest'}
              <p class="rounded-md border border-[#e2e4e8] bg-white px-4 py-3 text-sm text-[#4c5157]">{$locale === 'hr' ? 'Nastavljate bez računa. Ispunite podatke vozača u nastavku.' : 'You are continuing without an account. Complete the driver details below.'}</p>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#if authMode === 'register'}
                  <div><label class="field-label" for="booking_auth_first_name">Ime *</label><input id="booking_auth_first_name" class="field" bind:value={authFirstName} autocomplete="given-name" required /></div>
                  <div><label class="field-label" for="booking_auth_last_name">Prezime *</label><input id="booking_auth_last_name" class="field" bind:value={authLastName} autocomplete="family-name" required /></div>
                {/if}
                <div class={authMode === 'login' ? '' : 'md:col-span-1'}><label class="field-label" for="booking_auth_email">Email *</label><input id="booking_auth_email" type="email" class="field" bind:value={authEmail} autocomplete="email" required /></div>
                {#if authMode === 'register'}
                  <div><label class="field-label" for="booking_auth_phone">Telefon *</label><input id="booking_auth_phone" type="tel" class="field" bind:value={authPhone} autocomplete="tel" required /></div>
                {/if}
                <div>
                  <label class="field-label" for="booking_auth_password">Lozinka *</label>
                  <input id="booking_auth_password" type="password" class="field" bind:value={authPassword} autocomplete={authMode === 'login' ? 'current-password' : 'new-password'} minlength={authMode === 'register' ? 8 : undefined} required />
                  {#if authMode === 'register'}<p class="text-xs text-[#8b9099] mt-2">Najmanje 8 znakova.</p>{/if}
                </div>
                {#if authMode === 'register'}
                  <div><label class="field-label" for="booking_auth_password_confirm">Ponovite lozinku *</label><input id="booking_auth_password_confirm" type="password" class="field" bind:value={authPasswordConfirm} autocomplete="new-password" minlength="8" required /></div>
                {/if}
              </div>
              {#if authError}<p class="text-sm mt-4" style="color:#b42318">{authError}</p>{/if}
              {#if authMessage}<p class="text-sm mt-4" style="color:#067647">{authMessage}</p>{/if}
              <div class="mt-5">
                <button
                  type="button"
                  onclick={authenticateDuringBooking}
                  disabled={authLoading || !authEmail || !authPassword || (authMode === 'register' && (!authFirstName || !authLastName || !authPhone || !authPasswordConfirm))}
                  class="btn btn-primary disabled:opacity-50"
                >
                  {authLoading ? 'Molimo pričekajte…' : (authMode === 'login' ? 'Prijavi se' : 'Izradi račun')}
                </button>
              </div>
            {/if}
          {/if}
        </div>
        <h2 class="text-lg font-bold uppercase tracking-wide text-[#2b2b2b] mb-6">{$locale === 'hr' ? 'Podaci vozača' : 'Driver details'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          {#each driverFields as field}
            <div class="{field.key === 'address' || field.key === 'email' ? 'md:col-span-2' : ''}">
              <label class="field-label" for="booking_driver_{field.key}">{field.label}</label>
              <input
                id="booking_driver_{field.key}"
                type={field.type}
                class="field"
                max={field.key === 'dateOfBirth' ? maxDriverDob : undefined}
                autocomplete={field.key === 'firstName' ? 'given-name' : field.key === 'lastName' ? 'family-name' : field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : field.key === 'address' ? 'street-address' : field.key === 'city' ? 'address-level2' : field.key === 'zip' ? 'postal-code' : field.key === 'country' ? 'country-name' : 'off'}
                required
                bind:value={$booking.driverDetails[field.key as keyof typeof $booking.driverDetails]}
              />
              {#if field.key === 'dateOfBirth'}
                <p class="text-xs text-[#8b9099] mt-2">{$locale === 'hr' ? `Vozač mora imati najmanje ${minDriverAge} godina na dan preuzimanja. Najkasniji dopušteni datum rođenja je ${formatDate(maxDriverDob)}.` : `The driver must be at least ${minDriverAge} on pickup. The latest eligible date of birth is ${formatDate(maxDriverDob)}.`}</p>
              {/if}
            </div>
          {/each}
        </div>
        {#if driverError}
          <p class="text-sm mt-5 p-3 rounded-md" style="background:#fdecec;color:#b42318">{driverError}</p>
        {/if}
        <div class="flex gap-4 mt-8">
          <button onclick={() => goToStep(2)} class="btn btn-ghost px-6 py-3">← {$locale === 'hr' ? 'Natrag' : 'Back'}</button>
          <button onclick={continueToReview} class="btn btn-primary flex-1">{$locale === 'hr' ? 'Nastavi' : 'Continue'} →</button>
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
            <div><p class="field-label">{$locale === 'hr' ? 'Putnici' : 'Travellers'}</p><p class="text-sm text-[#2b2b2b]">{$booking.numAdults} {$locale === 'hr' ? 'odraslih' : 'adults'} · {$booking.numChildren} {$locale === 'hr' ? 'djece' : 'children'}</p></div>
            <div><p class="field-label">{$locale === 'hr' ? 'Plan puta' : 'Trip plan'}</p><p class="text-sm text-[#2b2b2b]">{$booking.destination} · {$booking.plannedKm} km</p></div>
          </div>
          <div class="space-y-2 mb-6 pb-6 border-b border-[#ededf0]">
            {#each selectedPricing.line_items as item}
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-[#7a7f86]">{item.label}</span>
                <span class="text-[#2b2b2b] whitespace-nowrap">{formatMoney(item.amount)}</span>
              </div>
            {/each}
            {#if selectedPricing.refundable_deposit > 0}
              <div class="flex justify-between gap-4 text-sm pt-2">
                <span class="text-[#7a7f86]">{$locale === 'hr' ? 'Povratni polog (odvojeno)' : 'Refundable deposit (separate)'}</span>
                <span class="text-[#2b2b2b] whitespace-nowrap">{formatMoney(selectedPricing.refundable_deposit)}</span>
              </div>
            {/if}
            <div class="flex justify-between font-bold text-lg pt-2"><span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Za plaćanje' : 'Payable total'}</span><span style="color:#b5890a">{formatMoney(totalPrice)}</span></div>
          </div>
          <p class="text-sm text-[#6b7178]"><b class="text-[#2b2b2b]">{$booking.driverDetails.firstName} {$booking.driverDetails.lastName}</b> · {$booking.driverDetails.email} · {$booking.driverDetails.phone}</p>
        </div>

        <div class="card card-static p-6 md:p-8">
          <h2 class="text-lg font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Način plaćanja' : 'Payment method'}</h2>
          <div class="grid md:grid-cols-2 gap-4 mb-6">
            <button onclick={() => paymentMethod = 'bank_transfer'} class="p-4 rounded-md text-center" style="border:2px solid {paymentMethod === 'bank_transfer' ? '#f5c518' : '#e2e4e8'}"><p class="font-semibold text-[#2b2b2b] text-sm">{$locale === 'hr' ? 'Bankovna uplata' : 'Bank transfer'}</p><p class="text-xs text-[#9aa0a8] mt-1">HUB-3 / PDF417</p></button>
            <button onclick={() => data.corvuspayAvailable && (paymentMethod = 'corvuspay')} disabled={!data.corvuspayAvailable} class="p-4 rounded-md text-center disabled:opacity-50" style="border:2px solid {paymentMethod === 'corvuspay' ? '#f5c518' : '#e2e4e8'}"><p class="font-semibold text-[#2b2b2b] text-sm">{$locale === 'hr' ? 'Kartica' : 'Card'}</p><p class="text-xs text-[#9aa0a8] mt-1">{data.corvuspayAvailable ? 'CorvusPay' : ($locale === 'hr' ? 'Uskoro dostupno' : 'Coming soon')}</p></button>
          </div>
          <div class="rounded-md p-4 mb-5 bg-[#f6f7f9] border border-[#ededf0]">
            <label class="flex gap-3 items-start cursor-pointer">
              <input type="checkbox" bind:checked={paymentSplit} class="mt-1" />
              <span class="text-sm text-[#4c5157]"><b>{$locale === 'hr' ? 'Plaćanje 50/50' : '50/50 payment'}</b><br />{$locale === 'hr' ? `${formatMoney(totalPrice / 2)} sada, ostatak do ${data.splitPaymentDueDays} dana prije preuzimanja.` : `${formatMoney(totalPrice / 2)} now, the rest ${data.splitPaymentDueDays} days before pickup.`}</span>
            </label>
          </div>
          <label class="flex gap-3 items-start mb-5">
            <input type="checkbox" bind:checked={termsAccepted} disabled={!termsScrolled && !termsAccepted} class="mt-1 disabled:opacity-40" required />
            <span class="text-sm text-[#4c5157]">
              {$locale === 'hr' ? 'Prihvaćam ' : 'I accept the '}
              <button type="button" class="underline font-semibold" onclick={openTerms}>{$locale === 'hr' ? 'uvjete najma' : 'rental terms'}</button>.
              <span class="block text-xs text-[#8b9099] mt-1">
                {#if !termsScrolled && !termsAccepted}
                  {$locale === 'hr' ? 'Otvorite uvjete i dođite do kraja teksta prije označavanja.' : 'Open the terms and reach the end of the text before checking this box.'}
                {:else}
                  {$locale === 'hr' ? 'Prihvat se bilježi kao revizijski trag; pravnu valjanost treba potvrditi pravni savjetnik.' : 'Acceptance is recorded as an audit trail; legal enforceability should be confirmed by legal counsel.'}
                {/if}
              </span>
            </span>
          </label>
          {#if submitError}
            <p class="text-sm mb-5 p-3 rounded-md" style="background:#fdecec;color:#b42318">{submitError}</p>
          {/if}
          <div class="flex gap-4">
            <button onclick={() => goToStep(3)} class="btn btn-ghost px-6 py-3">← {$locale === 'hr' ? 'Natrag' : 'Back'}</button>
            <button onclick={submitBooking} disabled={loading} class="btn btn-primary flex-1 disabled:opacity-50">{loading ? ($locale === 'hr' ? 'Obrađujem…' : 'Processing…') : `${$locale === 'hr' ? 'Potvrdi rezervaciju' : 'Confirm booking'} — ${formatMoney(totalPrice)}`}</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

{#if termsOpen}
  <div class="fixed inset-0 z-50 bg-[#17181a]/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-8" role="presentation" onclick={(event) => event.currentTarget === event.target && (termsOpen = false)}>
    <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[88dvh] flex flex-col overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.22)]" role="dialog" aria-modal="true" aria-labelledby="terms-title">
      <div class="px-6 md:px-8 py-5 border-b border-[#e8e9eb] flex items-start justify-between gap-5">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600] mb-2">Petroni</p>
          <h2 id="terms-title" class="font-black text-xl md:text-2xl text-[#2b2b2b]">{$locale === 'hr' ? 'Uvjeti najma' : 'Rental terms'}</h2>
          <p class="text-xs text-[#8b9099] mt-1">{$locale === 'hr' ? 'Aktivna verzija' : 'Active version'}: {data.terms?.version}</p>
        </div>
        <button class="w-10 h-10 rounded-full border border-[#dfe1e4] flex items-center justify-center text-[#5b6168] hover:bg-[#f3f4f6] hover:text-[#25282c] transition-colors active:scale-[0.96]" onclick={() => termsOpen = false} aria-label="Zatvori">
          <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div id="rental-terms-scroll" class="px-6 md:px-8 py-6 overflow-y-auto" onscroll={handleTermsScroll}>
        <div class="terms-document break-words text-sm leading-7 text-[#4c5157]">{@html renderTermsMarkup(activeTermsText)}</div>
      </div>
      <div class="px-6 md:px-8 py-5 border-t border-[#e8e9eb] bg-[#fafbfc] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
        <button class="btn btn-ghost sm:min-w-32 active:scale-[0.98]" onclick={() => termsOpen = false}>{$locale === 'hr' ? 'Zatvori' : 'Close'}</button>
        <button class="btn btn-primary sm:min-w-52 active:scale-[0.98] disabled:opacity-50" disabled={!termsScrolled} onclick={() => { termsAccepted = true; termsOpen = false; }}>{$locale === 'hr' ? 'Prihvaćam uvjete' : 'Accept terms'}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.terms-document h2) {
    margin: 1.4rem 0 0.65rem;
    color: #2b2b2b;
    font-size: 1.05rem;
    font-weight: 900;
    line-height: 1.25;
    text-transform: uppercase;
  }

  :global(.terms-document h3) {
    margin: 1.15rem 0 0.45rem;
    color: #2b2b2b;
    font-size: 0.95rem;
    font-weight: 800;
    line-height: 1.35;
  }

  :global(.terms-document p) {
    margin: 0 0 0.65rem;
  }

  :global(.terms-document ul),
  :global(.terms-document ol) {
    margin: 0.2rem 0 0.9rem 1.25rem;
    padding: 0;
  }

  :global(.terms-document li) {
    margin: 0.28rem 0;
    padding-left: 0.2rem;
  }
</style>
