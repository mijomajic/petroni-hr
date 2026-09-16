<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>Sign in — Alderway</title>
  <meta name="description" content="Sign in to your Alderway customer account." />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="min-h-[72vh] flex items-center py-16" style="background:#202124">
  <div class="container-x">
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <span class="eyebrow mb-3">Customer account</span>
        <h1 class="text-3xl font-extrabold uppercase tracking-tight text-white">Welcome back</h1>
        <p class="mt-3 text-sm text-white/60">View your bookings and orders in one place.</p>
      </div>

      <form method="POST" class="bg-white rounded-xl p-7 md:p-9 shadow-2xl">
        <input type="hidden" name="next" value={data.next} />
        <div class="space-y-5">
          <div>
            <label class="field-label" for="email">Email address</label>
            <input id="email" name="email" type="email" autocomplete="email" class="field" value={form?.email ?? ''} required />
          </div>
          <div>
            <div class="mb-1.5 flex items-center justify-between gap-4">
              <label class="field-label mb-0" for="password">Password</label>
              <a href="/zaboravljena-lozinka?context=account" class="text-xs font-semibold text-[#9a7600] hover:underline">Forgot your password?</a>
            </div>
            <input id="password" name="password" type="password" autocomplete="current-password" class="field" minlength="6" required />
          </div>

          {#if form?.error}
            <p class="rounded-md px-4 py-3 text-sm" style="background:#fdecec;color:#b42318">{form.error}</p>
          {:else if data.confirmationError}
            <p class="rounded-md px-4 py-3 text-sm" style="background:#fdecec;color:#b42318">The confirmation link is invalid or has expired. Please register again.</p>
          {:else if data.passwordChanged}
            <p class="rounded-md bg-[#ecfdf3] px-4 py-3 text-sm text-[#067647]">Your password has been changed. Sign in with the new password.</p>
          {/if}

          <button class="btn btn-primary w-full py-3.5" type="submit">Sign in</button>
        </div>
      </form>

      <p class="text-center text-sm text-white/60 mt-6">
        New to Alderway?
        <a class="font-semibold hover:underline" style="color:#c87442" href="/registracija?next={encodeURIComponent(data.next)}">Create an account.</a>
      </p>
    </div>
  </div>
</section>
