<script lang="ts">
  import { page } from '$app/state';
  import { BUSINESS } from '$lib/config/business';
  import { supabase } from '$lib/supabase';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);
  const passwordChanged = $derived(page.url.searchParams.get('password') === 'promijenjena');

  async function handleLogin() {
    loading = true;
    error = '';
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) error = err.message;
    else window.location.assign('/admin');
    loading = false;
  }
</script>

<svelte:head><title>Admin sign in — {BUSINESS.shortName}</title></svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-4 py-16" style="background:#fafbfc">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <img src={BUSINESS.logo} alt={BUSINESS.name} class="h-9 w-auto mx-auto mb-5" />
      <h1 class="text-xl font-bold uppercase tracking-wide text-[#2b2b2b]">Admin Panel</h1>
    </div>

    <div class="card p-8">
      <div class="space-y-5">
        <div><span class="field-label">Email</span><input type="email" class="field" bind:value={email} onkeydown={e => e.key === 'Enter' && handleLogin()} /></div>
        <div><div class="mb-1.5 flex items-center justify-between gap-4"><label class="field-label mb-0" for="admin_password">Password</label><a href="/zaboravljena-lozinka?context=admin" class="text-xs font-semibold text-[#9a7600] hover:underline">Forgot password?</a></div><input id="admin_password" type="password" class="field" bind:value={password} onkeydown={e => e.key === 'Enter' && handleLogin()} /></div>
        {#if error}
          <p class="text-sm p-3 rounded-md" style="background:#fdecec;color:#e11d48">{error}</p>
        {:else if passwordChanged}
          <p class="rounded-md bg-[#ecfdf3] p-3 text-sm text-[#067647]">Your password has been changed. Sign in again.</p>
        {/if}
        <button onclick={handleLogin} disabled={loading || !email || !password} class="btn btn-primary w-full disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
      </div>
    </div>
    <a href="/" class="block text-center mt-5 text-sm text-[#8b9099] hover:text-[#2b2b2b]">← Back to website</a>
  </div>
</div>
