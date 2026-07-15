<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  const money = (value: unknown) => `${Number(value ?? 0).toFixed(2)} EUR`;
  const dateTime = (value: string) => new Intl.DateTimeFormat('hr-HR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
</script>

<svelte:head><title>{data.booking.confirmation_number} — Rezervacije — Petroni</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-start justify-between gap-4">
    <div>
      <a href="/admin/rezervacije" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#d9dce1] bg-white text-sm font-bold text-[#454a50] hover:bg-[#f6f7f9] active:scale-[0.98]">← Natrag na rezervacije</a>
      <h1 class="text-3xl font-black uppercase mt-4">{data.booking.confirmation_number}</h1>
      <p class="text-sm text-[#7a7f86]">{data.booking.vehicles?.name} · {data.booking.pickup_date} – {data.booking.dropoff_date}</p>
    </div>
    <span class="px-3 py-2 rounded-xl text-xs font-bold uppercase bg-[#fff7e0] text-[#9a7600]">{data.booking.status}</span>
  </div>

  {#if form?.message}
    <div class="p-4 rounded-xl bg-[#fff7e0] text-[#6f5600] text-sm">{form.message}</div>
  {/if}

  <div class="grid lg:grid-cols-3 gap-6">
    <section class="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#ededf0]">
      <h2 class="font-bold uppercase tracking-wider mb-4">Rezervacija</h2>
      <dl class="grid sm:grid-cols-2 gap-4 text-sm">
        <div><dt class="text-[#7a7f86]">Preuzimanje</dt><dd>{data.booking.pickup_location}, {data.booking.pickup_date} u {data.booking.pickup_time}</dd></div>
        <div><dt class="text-[#7a7f86]">Povrat</dt><dd>{data.booking.dropoff_location}, {data.booking.dropoff_date} u {data.booking.dropoff_time}</dd></div>
        <div><dt class="text-[#7a7f86]">Putnici</dt><dd>{data.booking.num_adults} odraslih, {data.booking.num_children} djece</dd></div>
        <div><dt class="text-[#7a7f86]">Plan puta</dt><dd>{data.booking.destination} · {data.booking.planned_km} km</dd></div>
        <div><dt class="text-[#7a7f86]">Ukupno</dt><dd class="font-bold">{money(data.booking.total_price)}</dd></div>
        <div><dt class="text-[#7a7f86]">Povratni depozit</dt><dd>{money(data.booking.deposit_amount)}</dd></div>
      </dl>

      <h3 class="font-bold mt-6 mb-3">Obračun</h3>
      <div class="space-y-2 text-sm">
        {#each data.booking.price_breakdown?.line_items ?? [] as item}
          <div class="flex justify-between gap-4"><span>{item.label}</span><span>{money(item.amount)}</span></div>
        {/each}
      </div>

      <h3 class="font-bold mt-6 mb-3">Dodatne opcije</h3>
      {#if data.booking.booking_extra_selections?.length}
        <div class="space-y-2 text-sm">
          {#each data.booking.booking_extra_selections as selection}
            <div class="flex justify-between"><span>{selection.booking_extras?.name_hr} × {selection.qty}</span><span>{money(selection.total_price)}</span></div>
          {/each}
        </div>
      {:else}<p class="text-sm text-[#7a7f86]">Nema dodatnih opcija.</p>{/if}
    </section>

    <div class="space-y-6">
      <section class="p-6 rounded-2xl bg-white border border-[#ededf0]">
        <h2 class="font-bold uppercase tracking-wider mb-4">Vozač</h2>
        <div class="space-y-2 text-sm">
          <p><b>{data.booking.driver_name} {data.booking.driver_last_name}</b></p>
          <p>{data.booking.driver_email}</p><p>{data.booking.driver_phone}</p>
          <p>Rođen/a: {data.booking.driver_dob}</p>
          <p>Dozvola: {data.booking.driver_license} ({data.booking.driver_license_country})</p>
          <p>{data.booking.billing?.address}, {data.booking.billing?.zip} {data.booking.billing?.city}, {data.booking.billing?.country}</p>
        </div>
      </section>

      <section class="p-6 rounded-2xl bg-white border border-[#ededf0]">
        <h2 class="font-bold uppercase tracking-wider mb-4">E-suglasnost</h2>
        <div class="space-y-2 text-sm">
          <p>Verzija: <b>{data.booking.terms_version ?? '—'}</b></p>
          <p>Vrijeme: {data.booking.terms_accepted_at ? dateTime(data.booking.terms_accepted_at) : '—'}</p>
          <p>IP: {data.booking.terms_accepted_ip ?? '—'}</p>
          <p class="text-xs text-[#7a7f86]">Ovo je revizijski zapis prihvaćanja, ne jamstvo pravne provedivosti.</p>
        </div>
      </section>
    </div>
  </div>

  <div class="grid lg:grid-cols-2 gap-6">
    <section class="p-6 rounded-2xl bg-white border border-[#ededf0]">
      <h2 class="font-bold uppercase tracking-wider mb-4">Status rezervacije</h2>
      <form method="POST" action="?/status" class="flex gap-3">
        <select name="status" value={data.booking.status} class="field">
          <option value="pending">Na čekanju</option><option value="confirmed">Potvrđena</option>
          <option value="cancelled">Otkazana</option><option value="completed">Završena</option>
        </select>
        <button class="btn btn-primary hover:brightness-95 active:scale-[0.98] transition">Spremi</button>
      </form>
      <p class="mt-3 text-xs text-[#8b5a00]">Otkazivanje rezervacije ne vraća evidentirana sredstva automatski. Povrat se obrađuje zasebno.</p>
      <div class="mt-4 flex items-center justify-between gap-3 text-sm">
        <span>Email potvrde: <b>{data.booking.confirmation_email_sent ? 'poslan' : 'nije poslan'}</b></span>
        <form method="POST" action="?/retryConfirmation"><button class="text-sm underline">Pošalji ponovno</button></form>
      </div>
    </section>

    <section class="p-6 rounded-2xl bg-white border border-[#ededf0]">
      <h2 class="font-bold uppercase tracking-wider mb-4">Plaćanje</h2>
      <p class="text-sm mb-4">Način: <b>{data.booking.payment_method}</b> · ukupni status: <b>{data.booking.payment_status}</b></p>
      <div class="space-y-3">
        <form method="POST" action="?/payment" class="flex items-center gap-3">
          <input type="hidden" name="part" value="1" />
          <span class="text-sm flex-1">Prva rata ({money(data.booking.first_payment_amount)})</span>
          <select name="status" value={data.booking.first_payment_status} class="px-3 py-2 border rounded-lg text-sm"><option value="unpaid">Nije plaćena</option><option value="paid">Plaćena</option></select>
          <button class="px-3 py-2 rounded-lg text-sm font-bold bg-[#F5C518] text-black hover:bg-[#dfb314] active:scale-[0.97] transition">Spremi</button>
        </form>
        {#if data.booking.payment_split}
          <form method="POST" action="?/payment" class="flex items-center gap-3">
            <input type="hidden" name="part" value="2" />
            <span class="text-sm flex-1">Druga rata ({money(data.booking.second_payment_amount)}), do {data.booking.second_payment_due_date}</span>
            <select name="status" value={data.booking.second_payment_status} class="px-3 py-2 border rounded-lg text-sm"><option value="unpaid">Nije plaćena</option><option value="paid">Plaćena</option></select>
            <button class="px-3 py-2 rounded-lg text-sm font-bold bg-[#F5C518] text-black hover:bg-[#dfb314] active:scale-[0.97] transition">Spremi</button>
          </form>
          <div class="pt-3 border-t border-[#ededf0]">
            <p class="text-xs leading-relaxed text-[#7a7f86] mb-3">Nakon evidentirane prve rate izradite sigurnu poveznicu. Ona se automatski šalje klijentu emailom; izrada nove poveznice poništava prethodnu.</p>
            {#if form?.paymentLink}
              <label class="text-xs font-bold text-[#5b6168]">Sigurna poveznica — kopirajte je sada
                <input readonly value={form.paymentLink} class="field mt-1" onclick={(event) => event.currentTarget.select()} />
              </label>
            {/if}
            <div class="flex gap-3 mt-3">
              {#if data.booking.first_payment_status === 'paid'}
                <form method="POST" action="?/generatePaymentLink"><button class="btn btn-primary">{data.activeToken ? 'Izradi novu poveznicu' : 'Izradi sigurnu poveznicu'}</button></form>
              {:else}
                <span class="inline-flex px-4 py-2 rounded-lg bg-[#f3f4f6] text-sm font-bold text-[#8b9099]">Dostupno nakon uplate prve rate</span>
              {/if}
              {#if data.activeToken}<form method="POST" action="?/revokePaymentLink"><button class="btn border">Opozovi</button></form>{/if}
            </div>
            {#if data.activeToken}<p class="text-xs text-[#7a7f86] mt-2">Aktivna do {dateTime(data.activeToken.expires_at)}</p>{/if}
          </div>
        {/if}
      </div>
    </section>
  </div>

  <div class="grid lg:grid-cols-2 gap-6">
    <section class="p-6 rounded-2xl bg-white border border-[#ededf0]">
      <h2 class="font-bold uppercase tracking-wider mb-4">Email pokušaji</h2>
      <div class="space-y-3 text-sm">
        {#each data.emailAttempts as attempt}
          <div class="border-b border-[#ededf0] pb-2"><b>{attempt.message_type}</b> · {attempt.status}<br><span class="text-xs text-[#7a7f86]">{attempt.recipient} · {dateTime(attempt.created_at)}{attempt.error_message ? ` · ${attempt.error_message}` : ''}</span></div>
        {:else}<p class="text-[#7a7f86]">Nema zapisa.</p>{/each}
      </div>
    </section>
    <section class="p-6 rounded-2xl bg-white border border-[#ededf0]">
      <h2 class="font-bold uppercase tracking-wider mb-4">Administratorske promjene</h2>
      <div class="space-y-3 text-sm">
        {#each data.events as event}
          <div class="border-b border-[#ededf0] pb-2"><b>{event.action}</b><br><span class="text-xs text-[#7a7f86]">{event.actor_email} · {dateTime(event.created_at)}</span></div>
        {:else}<p class="text-[#7a7f86]">Nema zapisa.</p>{/each}
      </div>
    </section>
  </div>
</div>
