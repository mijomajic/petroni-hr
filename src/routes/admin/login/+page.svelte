<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleLogin() {
    loading = true;
    error = '';
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      error = err.message;
    } else {
      goto('/admin');
    }
    loading = false;
  }
</script>

<svelte:head><title>Admin Login — Petroni</title></svelte:head>

<div class="min-h-[100dvh] flex items-center justify-center px-4" style="background: #0a0a0a">
  <div class="w-full max-w-md">
    <div class="text-center mb-10">
      <img src="https://www.petroni.hr/wp-content/uploads/2024/03/Logo-Petroni-Yellow-New.png" alt="Petroni" class="h-10 w-auto mx-auto mb-6" />
      <h1 class="text-2xl font-black uppercase tracking-widest text-white">Admin Panel</h1>
    </div>

    <div class="p-8 rounded-[2rem]" style="background: #111; border: 1px solid #2a2a2a">
      <div class="space-y-4">
        {#each [{ label: 'Email', type: 'email', bind: email }, { label: 'Lozinka', type: 'password', bind: password }] as field}
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">{field.label}</label>
            <input
              type={field.type}
              class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
              style="background: #1a1a1a; border: 1px solid #2a2a2a"
              bind:value={field.bind}
              onkeydown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
        {/each}

        {#if error}
          <p class="text-sm p-3 rounded-xl" style="background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2)">{error}</p>
        {/if}

        <button
          onclick={handleLogin}
          disabled={loading || !email || !password}
          class="w-full py-4 rounded-full font-black text-sm uppercase tracking-widest text-black transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-40"
          style="background: #F5C518"
        >
          {loading ? 'Prijava...' : 'Prijava'}
        </button>
      </div>
    </div>
  </div>
</div>
