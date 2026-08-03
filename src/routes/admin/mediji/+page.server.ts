import { fail } from '@sveltejs/kit';
import { createHash, randomUUID } from 'node:crypto';
import sharp, { type Metadata } from 'sharp';
import { optionalTextField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

function safeFilename(name: string) {
  const extension = name.toLowerCase().match(/\.(?:jpe?g|png|webp|avif)$/)?.[0] ?? '';
  const stem = name
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'image';
  return `${stem}${extension}`;
}

export const load: PageServerLoad = async () => {
  const { data, error } = await supabaseAdmin
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(250);
  if (error) throw new Error(error.message);
  return { assets: data ?? [] };
};

export const actions: Actions = {
  upload: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0) return fail(400, { message: 'Odaberite sliku za upload.' });
    if (file.size > MAX_FILE_BYTES) return fail(400, { message: 'Slika može imati najviše 15 MB.' });
    if (!ALLOWED_MIME_TYPES.has(file.type)) return fail(400, { message: 'Dopušteni su JPG, PNG, WebP i AVIF formati.' });

    const original = Buffer.from(await file.arrayBuffer());
    let metadata: Metadata;
    let optimised: Buffer;
    try {
      const image = sharp(original, { limitInputPixels: 40_000_000, failOn: 'error' }).rotate();
      metadata = await image.metadata();
      if (!metadata.width || !metadata.height || !metadata.format) throw new Error('Datoteka nije valjana slika.');
      optimised = await image.resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    } catch {
      return fail(400, { message: 'Slika nije valjana ili je prevelika za sigurnu obradu.' });
    }

    const id = randomUUID();
    const date = new Date();
    const prefix = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${id}`;
    const originalPath = `${prefix}/original-${safeFilename(file.name)}`;
    const publicPath = `${prefix}/image.webp`;
    const originalUpload = await supabaseAdmin.storage
      .from('petroni-media-originals')
      .upload(originalPath, original, { contentType: file.type, upsert: false });
    if (originalUpload.error) return fail(400, { message: `Original nije spremljen: ${originalUpload.error.message}` });

    const publicUpload = await supabaseAdmin.storage
      .from('petroni-media')
      .upload(publicPath, optimised, { contentType: 'image/webp', cacheControl: '31536000, immutable', upsert: false });
    if (publicUpload.error) {
      await supabaseAdmin.storage.from('petroni-media-originals').remove([originalPath]);
      return fail(400, { message: `Optimizirana slika nije spremljena: ${publicUpload.error.message}` });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('petroni-media').getPublicUrl(publicPath);
    const asset = {
      id,
      original_path: originalPath,
      public_path: publicPath,
      public_url: publicUrlData.publicUrl,
      original_filename: file.name.slice(0, 255),
      original_mime_type: file.type,
      original_bytes: file.size,
      width: metadata.width,
      height: metadata.height,
      alt_hr: optionalTextField(form, 'alt_hr') ?? '',
      alt_en: optionalTextField(form, 'alt_en') ?? '',
      provenance: optionalTextField(form, 'provenance') ?? '',
      license_note: optionalTextField(form, 'license_note') ?? '',
      checksum_sha256: createHash('sha256').update(original).digest('hex'),
      created_by: administrator.user.id
    };
    const { error } = await supabaseAdmin.from('media_assets').insert(asset);
    if (error) {
      await Promise.allSettled([
        supabaseAdmin.storage.from('petroni-media-originals').remove([originalPath]),
        supabaseAdmin.storage.from('petroni-media').remove([publicPath])
      ]);
      return fail(400, { message: `Podaci o slici nisu spremljeni: ${error.message}` });
    }
    await recordAdminEvent({ administrator, entityType: 'media_asset', entityId: id, action: 'media_uploaded', afterState: asset });
    return { message: 'Slika je spremljena. U nastavku kopirajte javni URL za uporabu u sadržaju.' };
  },

  archive: async ({ request, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const id = String(form.get('id') ?? '');
    const { data: before } = await supabaseAdmin.from('media_assets').select('*').eq('id', id).single();
    if (!before) return fail(404, { message: 'Slika nije pronađena.' });
    if (before.status === 'archived') return { message: 'Slika je već arhivirana.' };
    const { data: after, error } = await supabaseAdmin
      .from('media_assets')
      .update({ status: 'archived', archived_at: new Date().toISOString(), archived_by: administrator.user.id })
      .eq('id', id)
      .select()
      .single();
    if (error) return fail(400, { message: error.message });
    await recordAdminEvent({ administrator, entityType: 'media_asset', entityId: id, action: 'media_archived', beforeState: before, afterState: after });
    return { message: 'Slika je arhivirana; datoteke su zadržane radi sigurnog povrata.' };
  }
};
