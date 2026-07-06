<script lang="ts">
  import { supabase } from '$lib/supabase';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleLogin() {
    loading = true;
    error = '';
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) error = err.message;
    else window.location.assign('/admin');
    loading = false;
  }
</script>

<svelte:head><title>Admin Prijava — Petroni</title></svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-4 py-16" style="background:#fafbfc">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <img src="https://www.petroni.hr/wp-content/uploads/2024/03/Logo-Petroni-Yellow-New.png" alt="Petroni" class="h-9 w-auto mx-auto mb-5" />
      <h1 class="text-xl font-bold uppercase tracking-wide text-[#2b2b2b]">Admin Panel</h1>
    </div>

    <div class="card p-8">
      <div class="space-y-5">
        <div><span class="field-label">Email</span><input type="email" class="field" bind:value={email} onkeydown={e => e.key === 'Enter' && handleLogin()} /></div>
        <div><span class="field-label">Lozinka</span><input type="password" class="field" bind:value={password} onkeydown={e => e.key === 'Enter' && handleLogin()} /></div>
        {#if error}
          <p class="text-sm p-3 rounded-md" style="background:#fdecec;color:#e11d48">{error}</p>
        {/if}
        <button onclick={handleLogin} disabled={loading || !email || !password} class="btn btn-primary w-full disabled:opacity-50">{loading ? 'Prijava…' : 'Prijava'}</button>
      </div>
    </div>
    <a href="/" class="block text-center mt-5 text-sm text-[#8b9099] hover:text-[#2b2b2b]">← Natrag na stranicu</a>
  </div>
</div>
