<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Objave — Admin — Petroni</title></svelte:head>

<div class="max-w-6xl">
  <div class="mb-8">
    <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Objave</h1>
    <p class="mt-2 text-sm text-[#7a7f86]">Novosti se spremaju server-side i bilježe u admin povijest.</p>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <section class="rounded-2xl border border-[#e7e8eb] bg-white p-5">
    <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Nova objava</h2>
    <form method="POST" action="?/savePost" class="grid gap-4 md:grid-cols-2">
      <label><span class="field-label">Naslov HR</span><input name="title_hr" class="field" required /></label>
      <label><span class="field-label">Naslov EN</span><input name="title_en" class="field" /></label>
      <label><span class="field-label">Slug</span><input name="slug" class="field" /></label>
      <label><span class="field-label">Cover slika</span><input name="cover_image" class="field" /></label>
      <label class="md:col-span-2"><span class="field-label">Sažetak HR</span><input name="excerpt_hr" class="field" /></label>
      <label><span class="field-label">Sadržaj HR</span><textarea name="content_hr" rows="7" class="field"></textarea></label>
      <label><span class="field-label">Sadržaj EN</span><textarea name="content_en" rows="7" class="field"></textarea></label>
      <label class="flex items-center gap-2 text-sm font-bold text-[#2b2b2b]"><input name="is_published" type="checkbox" class="h-4 w-4 accent-[#F5C518]" /> Objavljeno</label>
      <div class="md:col-span-2"><button class="btn btn-dark">Dodaj objavu</button></div>
    </form>
  </section>

  <section class="mt-8 space-y-4">
    {#each data.posts as post}
      <details class="rounded-2xl border border-[#e7e8eb] bg-white p-5">
        <summary class="cursor-pointer list-none">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="font-bold text-[#2b2b2b]">{post.title_hr}</p>
              <p class="mt-1 font-mono text-xs text-[#8b9099]">{post.slug}</p>
            </div>
            <span class="rounded-full {post.is_published ? 'bg-green-100 text-green-700' : 'bg-[#fff7e0] text-[#9a7600]'} px-2 py-1 text-[10px] font-bold uppercase">{post.is_published ? 'Objavljeno' : 'Skica'}</span>
          </div>
        </summary>
        <form method="POST" action="?/savePost" class="mt-5 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={post.id} />
          <label><span class="field-label">Naslov HR</span><input name="title_hr" class="field" value={post.title_hr} /></label>
          <label><span class="field-label">Naslov EN</span><input name="title_en" class="field" value={post.title_en ?? ''} /></label>
          <label><span class="field-label">Slug</span><input name="slug" class="field" value={post.slug} /></label>
          <label><span class="field-label">Cover slika</span><input name="cover_image" class="field" value={post.cover_image ?? ''} /></label>
          <label class="md:col-span-2"><span class="field-label">Sažetak HR</span><input name="excerpt_hr" class="field" value={post.excerpt_hr ?? ''} /></label>
          <label><span class="field-label">Sadržaj HR</span><textarea name="content_hr" rows="7" class="field">{post.content_hr ?? ''}</textarea></label>
          <label><span class="field-label">Sadržaj EN</span><textarea name="content_en" rows="7" class="field">{post.content_en ?? ''}</textarea></label>
          <label class="flex items-center gap-2 text-sm font-bold text-[#2b2b2b]"><input name="is_published" type="checkbox" checked={post.is_published} class="h-4 w-4 accent-[#F5C518]" /> Objavljeno</label>
          <div class="md:col-span-2 flex gap-2">
            <button class="rounded-md bg-[#F5C518] px-4 py-2 text-xs font-bold text-black">Spremi</button>
          </div>
        </form>
        <form method="POST" action="?/deletePost" class="mt-3" onsubmit={(event) => { if (!confirm('Obrisati objavu?')) event.preventDefault(); }}>
          <input type="hidden" name="id" value={post.id} />
          <button class="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Briši objavu</button>
        </form>
      </details>
    {/each}
  </section>
</div>
