<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>Create account — Alderway</title>
  <meta name="description" content="Create your Alderway customer account." />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="min-h-[72vh] flex items-center py-16" style="background:#202124">
  <div class="container-x">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <span class="eyebrow mb-3">New customer</span>
        <h1 class="text-3xl font-extrabold uppercase tracking-tight text-white">Create your account</h1>
        <p class="mt-3 text-sm text-white/60">Book faster and keep every request in one place.</p>
      </div>

      <div class="bg-white rounded-xl p-7 md:p-9 shadow-2xl">
        {#if form?.success}
          <div class="text-center py-8">
            <div class="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl" style="background:#f5e8df;color:#8a6500">✓</div>
            <h2 class="text-xl font-bold text-[#2b2b2b] mb-3">Check your email</h2>
            <p class="text-sm leading-relaxed text-[#6b7178]">We sent a confirmation link to <strong>{form.email}</strong>. You can sign in after confirming your address.</p>
            <a href="/prijava?next={encodeURIComponent(data.next)}" class="btn btn-primary mt-7">Back to sign in</a>
          </div>
        {:else}
          <form method="POST">
            <input type="hidden" name="next" value={data.next} />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="field-label" for="first_name">First name *</label>
                <input id="first_name" name="first_name" class="field" autocomplete="given-name" value={form?.values?.firstName ?? ''} required />
              </div>
              <div>
                <label class="field-label" for="last_name">Last name *</label>
                <input id="last_name" name="last_name" class="field" autocomplete="family-name" value={form?.values?.lastName ?? ''} required />
              </div>
              <div>
                <label class="field-label" for="email">Email address *</label>
                <input id="email" name="email" type="email" class="field" autocomplete="email" value={form?.values?.email ?? ''} required />
              </div>
              <div>
                <label class="field-label" for="phone">Telefon *</label>
                <input id="phone" name="phone" type="tel" class="field" autocomplete="tel" value={form?.values?.phone ?? ''} required />
              </div>
              <div>
                <label class="field-label" for="password">Password *</label>
                <input id="password" name="password" type="password" class="field" autocomplete="new-password" minlength="8" required />
                <p class="text-xs text-[#8b9099] mt-2">At least 8 characters.</p>
              </div>
              <div>
                <label class="field-label" for="password_confirm">Confirm password *</label>
                <input id="password_confirm" name="password_confirm" type="password" class="field" autocomplete="new-password" minlength="8" required />
              </div>
            </div>

            {#if form?.error}
              <p class="rounded-md px-4 py-3 text-sm mt-5" style="background:#fdecec;color:#b42318">{form.error}</p>
            {/if}

            <button class="btn btn-primary w-full py-3.5 mt-7" type="submit">Create account</button>
          </form>
        {/if}
      </div>

      <p class="text-center text-sm text-white/60 mt-6">
        Already have an account?
        <a class="font-semibold hover:underline" style="color:#c87442" href="/prijava?next={encodeURIComponent(data.next)}">Sign in.</a>
      </p>
    </div>
  </div>
</section>
