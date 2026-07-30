import { readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const directory = join(root, 'migration');
const manifestPath = join(directory, 'asset-manifest.json');
const restructure = process.argv.includes('--restructure');
const backupPath = join(directory, restructure ? 'production-restructure-reference-backup.json' : 'production-reference-backup.json');
const reportPath = join(directory, 'production-reference-update-report.json');
const bucket = process.env.PETRONI_ASSET_BUCKET || (restructure ? 'petroni-assets' : 'petroni-legacy-assets-staging');
const apply = process.argv.includes('--apply');
const baseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
if (!baseUrl || !serviceKey) throw new Error('PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required.');

const headers = { apikey: serviceKey, authorization: `Bearer ${serviceKey}` };
const publicUrl = key => `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`;
const jsonHeaders = { ...headers, 'content-type': 'application/json', prefer: 'return=representation' };
const writeJson = async (path, value) => { const temp = `${path}.tmp`; await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`); await rename(temp, path); };
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));

async function getAll(table, select) {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    const response = await fetch(`${baseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}`, { headers: { ...headers, range: `${start}-${start + 999}` } });
    if (!response.ok) throw new Error(`${table} read failed: ${response.status}`);
    const page = await response.json(); rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

async function patch(table, filter, body) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${filter}`, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${table} update failed: ${response.status} ${await response.text()}`);
  return response.json();
}

function replaceValue(value, map) {
  if (typeof value === 'string') return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map(item => replaceValue(item, map));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceValue(item, map)]));
  return value;
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const restructured = restructure ? JSON.parse(await readFile(join(directory, 'restructured-asset-manifest.json'), 'utf8')) : null;
const oldPublicUrl = asset => `${baseUrl}/storage/v1/object/public/petroni-legacy-assets-staging/${asset.object_key.split('/').map(encodeURIComponent).join('/')}`;
const map = restructure
  ? new Map(Object.values(manifest.assets).map(asset => [oldPublicUrl(asset), restructured.assets[asset.original_url]?.public_url]).filter(([, url]) => url))
  : new Map(Object.values(manifest.assets).filter(asset => asset.upload_result?.status === 'uploaded').map(asset => [asset.original_url, publicUrl(asset.object_key)]));
if (map.size !== 3213) throw new Error(`Expected 3213 uploaded manifest assets; found ${map.size}.`);

const bucketResponse = await fetch(`${baseUrl}/storage/v1/bucket/${encodeURIComponent(bucket)}`, { method: 'PUT', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ public: true }) });
if (!bucketResponse.ok) throw new Error(`Could not make staging bucket public: ${bucketResponse.status} ${await bucketResponse.text()}`);

const [products, posts, pages] = await Promise.all([
  getAll('products', 'id,slug,images'), getAll('posts', 'id,slug,cover_image'), getAll('site_pages', 'key,route,content')
]);
const changes = [];
for (const product of products) {
  const next = replaceValue(product.images, map);
  const replacements = (product.images ?? []).filter(url => map.has(url)).length;
  if (replacements) changes.push({ table: 'products', id: product.id, slug: product.slug, column: 'images', before: product.images, after: next, replacements });
}
for (const post of posts) if (map.has(post.cover_image)) changes.push({ table: 'posts', id: post.id, slug: post.slug, column: 'cover_image', before: post.cover_image, after: map.get(post.cover_image), replacements: 1 });
for (const page of pages) {
  const next = replaceValue(page.content, map);
  const before = JSON.stringify(page.content); const after = JSON.stringify(next);
  if (before !== after) changes.push({ table: 'site_pages', id: page.key, route: page.route, column: 'content', before: page.content, after: next, replacements: [...map.keys()].filter(url => before.includes(url)).length });
}

const totals = Object.fromEntries(['products', 'posts', 'site_pages'].map(table => [table, { records: changes.filter(change => change.table === table).length, replacements: changes.filter(change => change.table === table).reduce((sum, change) => sum + change.replacements, 0) }]));
const report = { generated_at: new Date().toISOString(), mode: apply ? 'apply' : 'dry_run', bucket, public_base_url: `${baseUrl}/storage/v1/object/public/${bucket}/`, totals, total_replacements: changes.reduce((sum, change) => sum + change.replacements, 0) };

if (apply) {
  let backup;
  try { backup = await readJson(backupPath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!backup) await writeJson(backupPath, { generated_at: new Date().toISOString(), bucket, changes });

  let next = 0;
  let completed = 0;
  const workers = Array.from({ length: 8 }, async () => {
    while (next < changes.length) {
      const change = changes[next++];
      await patch(change.table, `${change.table === 'site_pages' ? 'key' : 'id'}=eq.${encodeURIComponent(change.id)}`, { [change.column]: change.after });
      completed += 1;
      if (completed % 100 === 0 || completed === changes.length) console.log(`Updated ${completed}/${changes.length} records`);
    }
  });
  await Promise.all(workers);
}
await writeJson(reportPath, report);
console.log(JSON.stringify(report, null, 2));
