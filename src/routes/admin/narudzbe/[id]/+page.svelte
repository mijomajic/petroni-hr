<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  const order = $derived(data.order);
  const items = $derived(Array.isArray(order.items) ? order.items : []);

  function json(value: unknown) {
    return JSON.stringify(value ?? {}, null, 2);
  }
</script>

<svelte:head><title>Narudžba {order.confirmation_number ?? order.id.slice(0, 8)} — Admin — Petroni</title></svelte:head>

<div class="max-w-6xl">
  <div class="mb-8 flex items-center gap-4">
    <a href="/admin/narudzbe" class="rounded-md border border-[#d9dce1] bg-white px-4 py-2 text-sm font-bold text-[#454a50] hover:bg-[#f6f7f9]">Natrag</a>
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Narudžba {order.confirmation_number ?? order.id.slice(0, 8)}</h1>
      <p class="mt-1 text-sm text-[#7a7f86]">{new Date(order.created_at).toLocaleString('hr-HR')}</p>
    </div>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
    <main class="space-y-6">
      <section class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
        <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Stavke</h2>
        <div class="divide-y divide-[#ededf0]">
          {#each items as item}
            <div class="grid gap-2 py-3 md:grid-cols-[1fr_90px_120px]">
              <p class="font-bold text-[#2b2b2b]">{item.name ?? item.name_hr ?? item.slug ?? 'Proizvod'}</p>
              <p class="text-sm text-[#7a7f86]">Količina: {item.quantity ?? item.qty ?? 1}</p>
              <p class="font-bold text-[#b5890a]">{Number(item.total ?? item.price ?? 0).toFixed(2)} EUR</p>
            </div>
          {/each}
          {#if items.length === 0}
            <pre class="overflow-auto rounded-xl bg-[#f6f7f9] p-4 text-xs text-[#5b6168]">{json(order.items)}</pre>
          {/if}
        </div>
      </section>

      <section class="grid gap-6 md:grid-cols-2">
        <div class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
          <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Dostava</h2>
          <pre class="overflow-auto whitespace-pre-wrap rounded-xl bg-[#f6f7f9] p-4 text-xs text-[#5b6168]">{json(order.shipping_address)}</pre>
        </div>
        <div class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
          <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Adresa za račun</h2>
          <pre class="overflow-auto whitespace-pre-wrap rounded-xl bg-[#f6f7f9] p-4 text-xs text-[#5b6168]">{json(order.billing_address)}</pre>
        </div>
      </section>

      <section class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
        <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Povijest</h2>
        <div class="grid gap-6 lg:grid-cols-3">
          <div>
            <h3 class="mb-2 text-xs font-bold uppercase tracking-widest text-[#7a7f86]">Admin</h3>
            {#each data.events as event}
              <p class="border-b border-[#ededf0] py-2 text-xs text-[#5b6168]">{event.action} · {new Date(event.created_at).toLocaleString('hr-HR')}</p>
            {/each}
          </div>
          <div>
            <h3 class="mb-2 text-xs font-bold uppercase tracking-widest text-[#7a7f86]">Email</h3>
            {#each data.emailAttempts as attempt}
              <p class="border-b border-[#ededf0] py-2 text-xs text-[#5b6168]">{attempt.message_type} · {attempt.status} · {new Date(attempt.created_at).toLocaleString('hr-HR')}</p>
            {/each}
          </div>
          <div>
            <h3 class="mb-2 text-xs font-bold uppercase tracking-widest text-[#7a7f86]">Plaćanja</h3>
            {#each data.paymentAttempts as attempt}
              <p class="border-b border-[#ededf0] py-2 text-xs text-[#5b6168]">{attempt.action} · {attempt.status} · {new Date(attempt.created_at).toLocaleString('hr-HR')}</p>
            {/each}
          </div>
        </div>
      </section>
    </main>

    <aside class="space-y-6">
      <section class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
        <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Kupac</h2>
        <p class="font-bold text-[#2b2b2b]">{order.customer_name}</p>
        <p class="text-sm text-[#7a7f86]">{order.customer_email}</p>
        <p class="text-sm text-[#7a7f86]">{order.customer_phone ?? '-'}</p>
        <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div><span class="field-label">Subtotal</span><p>{Number(order.subtotal).toFixed(2)} EUR</p></div>
          <div><span class="field-label">Dostava</span><p>{Number(order.shipping_cost).toFixed(2)} EUR</p></div>
          <div class="col-span-2"><span class="field-label">Ukupno</span><p class="text-xl font-black text-[#b5890a]">{Number(order.total).toFixed(2)} EUR</p></div>
        </div>
      </section>

      <section class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
        <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Operacije</h2>
        <form method="POST" action="?/status" class="space-y-3">
          <label><span class="field-label">Status narudžbe</span>
            <select name="status" class="field" value={order.status} disabled={order.status === 'cancelled'}>
              <option value="pending">Na čekanju</option>
              <option value="processing">U obradi</option>
              <option value="completed">Završena/poslana</option>
              <option value="cancelled">Otkazana</option>
            </select>
          </label>
          <button disabled={order.status === 'cancelled'} class="btn btn-primary w-full text-black disabled:opacity-50">Spremi status</button>
        </form>
        <p class="mt-3 text-xs text-[#8b5a00]">Otkazivanje narudžbe ne vraća evidentirana sredstva automatski. Povrat se obrađuje zasebno.</p>
        <form method="POST" action="?/payment" class="mt-5 space-y-3">
          <label><span class="field-label">Status plaćanja</span>
            <select name="payment_status" class="field" value={order.payment_status} disabled={order.status === 'cancelled'}>
              <option value="unpaid" disabled={order.payment_status === 'paid'}>Nije plaćeno</option>
              <option value="paid">Plaćeno</option>
            </select>
          </label>
          <button disabled={order.status === 'cancelled'} class="btn btn-dark w-full disabled:opacity-50">Spremi plaćanje</button>
        </form>
        <form method="POST" action="?/retryConfirmation" class="mt-5">
          <button class="btn btn-ghost w-full">Ponovno pošalji potvrdu</button>
        </form>
        <p class="mt-4 text-xs text-[#8b9099]">PDF potvrda narudžbe i plaćanja automatski se šalje kada je narudžba plaćena i označena kao završena/poslana. Ne predstavlja službeni fiskalizirani račun.</p>
      </section>
    </aside>
  </div>
</div>
