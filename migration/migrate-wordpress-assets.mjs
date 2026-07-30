import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

const root = process.cwd();
const migrationDir = join(root, 'migration');
const defaults = {
  input: join(migrationDir, 'asset-urls.txt'),
  manifest: join(migrationDir, 'asset-manifest.json'),
  failures: join(migrationDir, 'asset-failures.json'),
  summary: join(migrationDir, 'asset-migration-summary.md'),
  bucket: 'petroni-legacy-assets-staging',
  prefix: 'legacy-wp-2026-07',
  concurrency: 8,
  retries: 4,
  backoffMs: 500
};

function parseArgs(argv) {
  const options = { ...defaults, dryRun: false, downloadOnly: false, sample: 0, createBucket: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--download-only') options.downloadOnly = true;
    else if (arg === '--create-bucket') options.createBucket = true;
    else if (arg === '--sample') options.sample = Number(argv[++index]);
    else if (arg === '--concurrency') options.concurrency = Number(argv[++index]);
    else if (arg === '--retries') options.retries = Number(argv[++index]);
    else if (arg === '--backoff-ms') options.backoffMs = Number(argv[++index]);
    else if (arg === '--bucket') options.bucket = argv[++index];
    else if (arg === '--prefix') options.prefix = argv[++index].replace(/^\/+|\/+$/g, '');
    else if (arg === '--help') {
      console.log(`Usage: node --env-file=.env migration/migrate-wordpress-assets.mjs [options]

Modes:
  --dry-run              Select and validate work without downloading or uploading.
  --download-only        Download/validate/checksum assets but do not write Storage.
  --sample <count>       Run a deterministic extension-diverse sample (e.g. 20).

Storage options:
  --bucket <name>        Staging bucket name (default: ${defaults.bucket}).
  --prefix <path>        Versioned object prefix (default: ${defaults.prefix}).
  --create-bucket        Create the bucket if absent; never implied by another mode.

Safety options:
  --concurrency <n>      Parallel downloads (default: 8).
  --retries <n>          Retries after the first attempt (default: 4).
  --backoff-ms <n>       Initial exponential backoff in ms (default: 500).
`);
      process.exit(0);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(options.concurrency) || options.concurrency < 1) throw new Error('--concurrency must be a positive integer.');
  if (!Number.isInteger(options.sample) || options.sample < 0) throw new Error('--sample must be a non-negative integer.');
  if (options.dryRun && options.downloadOnly) throw new Error('Choose either --dry-run or --download-only.');
  return options;
}

function isPetroniLegacyUrl(value) {
  try {
    const url = new URL(value);
    return ['petroni.hr', 'www.petroni.hr'].includes(url.hostname.toLowerCase()) && /^\/wp-content\//i.test(url.pathname);
  } catch {
    return false;
  }
}

function extension(url) {
  return extname(new URL(url).pathname).slice(1).toLowerCase() || 'extensionless';
}

function objectKey(url, prefix) {
  // URL.pathname is percent-encoded. Decode it once, then make the storage key
  // ASCII-only. Supabase Storage rejects Unicode object keys, so non-ASCII
  // code points use a reversible `__uXXXX__` representation. The manifest keeps
  // the original URL and source-relative path as the canonical source record.
  const pathname = decodeURIComponent(new URL(url).pathname).replace(/^\/+/, '');
  if (!pathname.startsWith('wp-content/')) throw new Error(`Unexpected legacy path: ${url}`);
  const asciiPath = [...pathname].map(character => /[A-Za-z0-9._/-]/.test(character)
    ? character
    : `__u${character.codePointAt(0).toString(16).padStart(4, '0')}__`).join('');
  return `${prefix}/${asciiPath}`;
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function looksLikeHtml(buffer, contentType) {
  if (/\btext\/html\b|\bapplication\/xhtml\+xml\b/i.test(contentType ?? '')) return true;
  const beginning = buffer.subarray(0, 1024).toString('utf8').replace(/^\uFEFF?\s*/, '').toLowerCase();
  return beginning.startsWith('<!doctype html') || beginning.startsWith('<html') || beginning.includes('<head>');
}

function transient(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function withRetries(task, options) {
  let lastError;
  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    try {
      return await task(attempt);
    } catch (error) {
      lastError = error;
      if (!error.transient || attempt === options.retries) throw error;
      const jitter = Math.floor(Math.random() * Math.max(1, options.backoffMs / 4));
      await sleep(options.backoffMs * 2 ** attempt + jitter);
    }
  }
  throw lastError;
}

function requestError(message, status) {
  const error = new Error(message);
  error.status = status;
  error.transient = status === undefined || transient(status);
  return error;
}

async function download(url, options) {
  return withRetries(async () => {
    let response;
    try {
      response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'PetroniAssetMigration/1.0 (+asset preservation)' } });
    } catch (error) {
      throw requestError(`Network error: ${error.message}`);
    }
    if (!response.ok) throw requestError(`HTTP ${response.status}`, response.status);
    const body = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type')?.split(';')[0].trim() || 'application/octet-stream';
    if (looksLikeHtml(body, contentType)) {
      const error = requestError('Rejected HTML document returned in place of an asset', response.status);
      error.transient = false;
      throw error;
    }
    if (body.length === 0) {
      const error = requestError('Rejected zero-byte asset', response.status);
      error.transient = false;
      throw error;
    }
    return { body, contentType, httpStatus: response.status, finalUrl: response.url };
  }, options);
}

function storageHeaders(serviceKey) {
  return { apikey: serviceKey, authorization: `Bearer ${serviceKey}` };
}

async function bucketExists(baseUrl, serviceKey, bucket) {
  const response = await fetch(`${baseUrl}/storage/v1/bucket/${encodeURIComponent(bucket)}`, { headers: storageHeaders(serviceKey) });
  // Supabase Storage currently returns HTTP 400 with a NoSuchBucket payload
  // for a missing bucket, rather than a literal HTTP 404.
  const payload = await response.json().catch(() => null);
  if (response.status === 404 || payload?.code === 'NoSuchBucket') return false;
  if (!response.ok) throw requestError(`Storage bucket lookup failed: HTTP ${response.status}`, response.status);
  return true;
}

async function createBucket(baseUrl, serviceKey, bucket) {
  const response = await fetch(`${baseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...storageHeaders(serviceKey), 'content-type': 'application/json' },
    body: JSON.stringify({ id: bucket, name: bucket, public: false })
  });
  if (!response.ok && response.status !== 409) throw requestError(`Storage bucket creation failed: HTTP ${response.status}`, response.status);
}

async function existingObjectChecksum(baseUrl, serviceKey, bucket, key) {
  const response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`, { headers: storageHeaders(serviceKey) });
  // As with buckets, Supabase Storage may wrap a not-found object response in
  // HTTP 400 while exposing the real condition in the JSON error code.
  if (response.status === 404) return null;
  if (response.status === 400) {
    const payload = await response.json().catch(() => null);
    if (payload?.code === 'NoSuchKey') return null;
    throw requestError(`Storage object lookup failed: HTTP ${response.status}`, response.status);
  }
  if (!response.ok) throw requestError(`Storage object lookup failed: HTTP ${response.status}`, response.status);
  return sha256(Buffer.from(await response.arrayBuffer()));
}

async function upload(baseUrl, serviceKey, bucket, key, body, contentType) {
  const response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: { ...storageHeaders(serviceKey), 'content-type': contentType, 'x-upsert': 'false' },
    body
  });
  if (!response.ok) throw requestError(`Storage upload failed: HTTP ${response.status}`, response.status);
  return await response.json();
}

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}

async function writeJsonAtomic(path, value) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, path);
}

function chooseSample(urls, count) {
  if (!count) return urls;
  const wanted = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'pdf'];
  const selected = [];
  for (const type of wanted) {
    const url = urls.find(candidate => extension(candidate) === type && !selected.includes(candidate));
    if (url) selected.push(url);
  }
  for (const url of urls) if (selected.length < count && !selected.includes(url)) selected.push(url);
  return selected.slice(0, count);
}

async function concurrent(items, limit, worker) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) await worker(items[cursor++]);
  }));
}

function renderSummary(manifest, failures, options, urls) {
  const records = Object.values(manifest.assets);
  const resultCounts = records.reduce((counts, record) => {
    const key = record.upload_result?.status ?? record.result ?? 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
  return `# Petroni WordPress asset migration summary\n\nGenerated: ${new Date().toISOString()}\n\n## Run configuration\n\n- Mode: ${options.dryRun ? 'dry-run' : options.downloadOnly ? 'download-only' : 'upload'}\n- Input URLs selected: ${urls.length}\n- Concurrency: ${options.concurrency}\n- Retries after first attempt: ${options.retries}\n- Bucket: \`${options.bucket}\`\n- Prefix: \`${options.prefix}/\`\n\n## Results\n\n- Manifest records: ${records.length}\n- Failures in this manifest: ${failures.failures.length}\n${Object.entries(resultCounts).map(([name, count]) => `- ${name}: ${count}`).join('\n')}\n\nNo production database records, historical migrations, DNS, Vercel configuration, or deployed application code were changed by this script.\n`;
}

const options = parseArgs(process.argv.slice(2));
const allUrls = (await readFile(options.input, 'utf8')).split(/\r?\n/).filter(Boolean);
const petroniUrls = [...new Set(allUrls.filter(isPetroniLegacyUrl))].sort();
const urls = chooseSample(petroniUrls, options.sample);
if (!urls.length) throw new Error('No Petroni WordPress URLs were selected.');

const manifest = await readJson(options.manifest, { version: 1, generated_at: new Date().toISOString(), assets: {} });
manifest.updated_at = new Date().toISOString();
manifest.configuration = { bucket: options.bucket, prefix: options.prefix, source_count: petroniUrls.length };
const failures = { generated_at: new Date().toISOString(), failures: [] };

const baseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
if (!options.dryRun && !options.downloadOnly && (!baseUrl || !serviceKey)) throw new Error('PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required for upload mode.');
if (!options.dryRun && !options.downloadOnly) {
  const exists = await bucketExists(baseUrl, serviceKey, options.bucket);
  if (!exists && !options.createBucket) throw new Error(`Storage bucket ${options.bucket} does not exist. Re-run with --create-bucket after approval.`);
  if (!exists) await createBucket(baseUrl, serviceKey, options.bucket);
}

await concurrent(urls, options.concurrency, async url => {
  const key = objectKey(url, options.prefix);
  const existing = manifest.assets[url];
  if (!options.dryRun && !options.downloadOnly && existing?.upload_result?.status === 'uploaded' && existing.object_key === key) return;
  if (options.dryRun) {
    manifest.assets[url] = { original_url: url, object_key: key, result: 'dry_run_planned', selected_at: new Date().toISOString() };
    return;
  }
  try {
    const downloaded = await download(url, options);
    const checksum = sha256(downloaded.body);
    const entry = { original_url: url, object_key: key, content_type: downloaded.contentType, byte_size: downloaded.body.length, sha256: checksum, http_status: downloaded.httpStatus, final_redirected_url: downloaded.finalUrl, downloaded_at: new Date().toISOString() };
    if (options.downloadOnly) entry.upload_result = { status: 'download_only' };
    else {
      const storedChecksum = await existingObjectChecksum(baseUrl, serviceKey, options.bucket, key);
      if (storedChecksum === checksum) entry.upload_result = { status: 'already_present_checksum_match' };
      else if (storedChecksum) throw requestError(`Storage object conflict at ${key}: checksum differs`, 409);
      else {
        await upload(baseUrl, serviceKey, options.bucket, key, downloaded.body, downloaded.contentType);
        entry.upload_result = { status: 'uploaded' };
      }
    }
    manifest.assets[url] = entry;
  } catch (error) {
    const failure = { original_url: url, object_key: key, error: error.message, http_status: error.status ?? null, recorded_at: new Date().toISOString() };
    failures.failures.push(failure);
    manifest.assets[url] = { ...failure, upload_result: { status: 'failed' } };
  }
});

await writeJsonAtomic(options.manifest, manifest);
await writeJsonAtomic(options.failures, failures);
await writeFile(options.summary, renderSummary(manifest, failures, options, urls));
console.log(JSON.stringify({ selected: urls.length, manifest: options.manifest, failures: failures.failures.length, mode: options.dryRun ? 'dry-run' : options.downloadOnly ? 'download-only' : 'upload' }, null, 2));
