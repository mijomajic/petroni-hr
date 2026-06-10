<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Post } from '$lib/supabase';

  let posts: Post[] = $state([]);
  let loading = $state(true);
  let editing: Partial<Post> | null = $state(null);
  let saving = $state(false);

  async function savePost() {
    if (!editing) return;
    saving = true;
    if (editing.id) {
      await supabase.from('posts').update(editing).eq('id', editing.id);
    } else {
      await supabase.from('posts').insert({ ...editing, slug: editing.title_hr?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? '' });
    }
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    posts = data ?? [];
    editing = null;
    saving = false;
  }

  async function deletePost(id: string) {
    if (!confirm('Obrisati objavu?')) return;
    await supabase.from('posts').delete().eq('id', id);
    posts = posts.filter(p => p.id !== id);
  }

  onMount(async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    posts = data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Objave — Admin — Petroni</title></svelte:head>

<div class="max-w-4xl">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Objave</h1>
    <button onclick={() => editing = { title_hr: '', title_en: '', content_hr: '', content_en: '', is_published: false }} class="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest text-black" style="background: #F5C518">
      + Nova objava
    </button>
  </div>

  {#if editing}
    <div class="p-8 rounded-[2rem] mb-8" style="background: #ffffff; border: 1px solid #e7e8eb">
      <h2 class="font-bold text-[#2b2b2b] mb-6 uppercase tracking-widest">{editing.id ? 'Uredi objavu' : 'Nova objava'}</h2>
      <div class="space-y-4">
        {#each [{ k: 'title_hr', l: 'Naslov (HR)' }, { k: 'title_en', l: 'Naslov (EN)' }] as f}
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">{f.l}</label>
            <input type="text" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={editing[f.k as keyof typeof editing] as string} />
          </div>
        {/each}
        {#each [{ k: 'content_hr', l: 'Sadržaj (HR)' }, { k: 'content_en', l: 'Sadržaj (EN)' }] as f}
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">{f.l}</label>
            <textarea rows="6" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none resize-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={editing[f.k as keyof typeof editing] as string}></textarea>
          </div>
        {/each}
        <div class="space-y-2">
          <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">Cover Image URL</label>
          <input type="text" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm font-mono focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={editing.cover_image as string} />
        </div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" class="w-4 h-4 accent-yellow-400" bind:checked={editing.is_published} />
          <span class="text-sm text-[#2b2b2b]">Objaviti odmah</span>
        </label>
        <div class="flex gap-4">
          <button onclick={() => editing = null} class="px-6 py-3 rounded-full text-sm font-bold" style="color: #7a7f86; border: 1px solid #e7e8eb">Odustani</button>
          <button onclick={savePost} disabled={saving} class="flex-1 py-3 rounded-full font-black text-sm uppercase tracking-widest text-black disabled:opacity-40" style="background: #F5C518">
            {saving ? 'Sprema...' : 'Spremi'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <div class="rounded-2xl overflow-hidden" style="background: #ffffff; border: 1px solid #ededf0">
    {#if loading}
      <div class="p-8 space-y-3">{#each [1,2,3] as _}<div class="h-12 animate-pulse rounded-xl" style="background: #f6f7f9"></div>{/each}</div>
    {:else}
      {#each posts as post}
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom: 1px solid #f0f1f3">
          <div>
            <p class="font-medium text-[#2b2b2b]">{post.title_hr}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style="{post.is_published ? 'background: rgba(22,163,74,0.15); color: #16a34a' : 'background: rgba(245,197,24,0.1); color: #F5C518'}">
                {post.is_published ? 'Objavljeno' : 'Skica'}
              </span>
              <span class="text-xs" style="color: #7a7f86">{new Date(post.created_at).toLocaleDateString('hr-HR')}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick={() => editing = { ...post }} class="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors hover:bg-[#f1f2f4]" style="color: #7a7f86; border: 1px solid #e7e8eb">Uredi</button>
            <button onclick={() => deletePost(post.id)} class="px-3 py-1.5 rounded-xl text-xs font-bold" style="color: #ef4444; border: 1px solid rgba(239,68,68,0.2)">Briši</button>
          </div>
        </div>
      {/each}
      {#if posts.length === 0}<p class="p-8 text-center text-sm" style="color: #7a7f86">Nema objava.</p>{/if}
    {/if}
  </div>
</div>
