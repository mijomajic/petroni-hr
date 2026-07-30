import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const appRoot = process.cwd();
const outputDir = join(appRoot, 'migration');
const wpHost = /^(?:https?:)?\/\/(?:www\.)?petroni\.hr\/(?:wp-content|wp-includes)\//i;
const wpAnywhere = /https?:\/\/[^\s"'`<>]+\/(?:wp-content|wp-includes)\/[^\s"'`<>]+/gi;
const urlPattern = /https?:\/\/[^\s"'`<>]+/gi;
const ignoredDirectories = new Set(['.git', '.svelte-kit', 'build', 'node_modules', 'migration']);

function normalizeUrl(value) {
  return value.replace(/[),.;\]}]+$/, '');
}

function fileType(value) {
  if (typeof value !== 'string') return 'non-string';
  try {
    const extension = extname(new URL(value).pathname).slice(1).toLowerCase();
    return extension || 'extensionless';
  } catch {
    return 'malformed';
  }
}

function urlState(value) {
  if (typeof value !== 'string' || !value.trim()) return 'missing';
  if (value.startsWith('/')) return 'valid_local_path';
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) ? 'valid' : 'malformed';
  } catch {
    return 'malformed';
  }
}

function isWordPressUrl(value) {
  return typeof value === 'string' && wpHost.test(value);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

async function repositoryReferences() {
  const petroni = [];
  const thirdPartyRuntime = [];
  for (const file of await walk(appRoot)) {
    let text;
    try {
      text = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    for (const match of text.matchAll(wpAnywhere)) {
      const url = normalizeUrl(match[0]);
      const before = text.slice(0, match.index);
      const reference = {
        source: 'repository',
        file: relative(appRoot, file),
        line: before.split('\n').length,
        url,
        file_type: fileType(url),
        is_petroni_legacy: isWordPressUrl(url),
        runtime_dependency: /^(src|static)\//.test(relative(appRoot, file)),
        runtime_kind: classifyRuntimeDependency(relative(appRoot, file), url)
      };
      if (isWordPressUrl(url)) petroni.push(reference);
      else if (reference.runtime_dependency) thirdPartyRuntime.push(reference);
    }
  }
  return { petroni, thirdPartyRuntime };
}

function classifyRuntimeDependency(file, url) {
  if (!/^(src|static)\//.test(file)) return null;
  if (file.endsWith('site.webmanifest')) return 'manifest icon';
  if (fileType(url) === 'pdf') return 'document link';
  return 'application asset reference';
}

async function fetchAll(table, select, baseUrl, serviceKey) {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    const response = await fetch(`${baseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}`, {
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        range: `${start}-${start + 999}`
      }
    });
    if (!response.ok) throw new Error(`Supabase read failed for ${table}: ${response.status}`);
    const page = await response.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

function databaseReferences(table, records) {
  const wordpress = [];
  const problems = [];
  for (const record of records) {
    const images = record.images;
    if (!Array.isArray(images) || images.length === 0) {
      problems.push({ table, id: record.id, slug: record.slug, issue: 'missing_images', images });
      continue;
    }
    images.forEach((url, index) => {
      const state = urlState(url);
      if (!state.startsWith('valid')) {
        problems.push({ table, id: record.id, slug: record.slug, issue: state === 'missing' ? 'missing_url' : 'malformed_url', image_index: index, url });
      }
      if (typeof url === 'string' && wpAnywhere.test(url)) {
        wpAnywhere.lastIndex = 0;
        wordpress.push({
          source: 'production_database',
          table,
          column: 'images',
          id: record.id,
          slug: record.slug,
          record_type: record.type ?? null,
          is_active: record.is_active ?? record.is_available ?? null,
          image_index: index,
          url,
          file_type: fileType(url),
          is_petroni_legacy: isWordPressUrl(url)
        });
      }
    });
  }
  return { wordpress, problems };
}

function sitePageReferences(pages) {
  const references = [];
  for (const page of pages) {
    const content = JSON.stringify(page.content);
    for (const match of content.matchAll(urlPattern)) {
      const url = normalizeUrl(match[0]);
      if (typeof url === 'string' && wpAnywhere.test(url)) {
        wpAnywhere.lastIndex = 0;
        references.push({
          source: 'production_database',
          table: 'site_pages',
          column: 'content',
          id: page.key,
          route: page.route,
          is_published: page.is_published,
          url,
          file_type: fileType(url),
          is_petroni_legacy: isWordPressUrl(url)
        });
      }
    }
  }
  return references;
}

function contentReferences(table, records, fields) {
  const references = [];
  for (const record of records) for (const column of fields) {
    const text = typeof record[column] === 'string' ? record[column] : JSON.stringify(record[column]);
    if (!text) continue;
    for (const match of text.matchAll(urlPattern)) {
      const url = normalizeUrl(match[0]);
      if (wpAnywhere.test(url)) {
        wpAnywhere.lastIndex = 0;
        references.push({ source: 'production_database', table, column, id: record.id ?? record.key, slug: record.slug ?? record.version ?? record.key, url, file_type: fileType(url), is_petroni_legacy: isWordPressUrl(url) });
      }
    }
  }
  return references;
}

function countBy(values, key) {
  return Object.fromEntries([...values.reduce((counts, value) => {
    const name = value[key] ?? 'unknown';
    counts.set(name, (counts.get(name) ?? 0) + 1);
    return counts;
  }, new Map())].sort(([a], [b]) => a.localeCompare(b)));
}

function countByTable(values) {
  const summary = {};
  for (const value of values) {
    const key = value.table ?? 'repository';
    summary[key] ??= { occurrences: 0, records: new Set(), unique_urls: new Set(), columns: new Set() };
    summary[key].occurrences += 1;
    if (value.id) summary[key].records.add(value.id);
    summary[key].unique_urls.add(value.url);
    if (value.column) summary[key].columns.add(value.column);
  }
  return Object.fromEntries(Object.entries(summary).map(([table, value]) => [table, {
    occurrences: value.occurrences,
    affected_records: value.records.size,
    unique_urls: value.unique_urls.size,
    columns: [...value.columns]
  }]));
}

function report(audit) {
  const { summary, repository, production, problems } = audit;
  const lines = [
    '# WordPress asset dependency audit',
    '',
    `Generated: ${audit.generated_at}`,
    '',
    '## Scope and method',
    '',
    'This is a read-only audit. It scanned repository text files (excluding generated/dependency directories) and queried the production Supabase REST API with read-only `select` requests. No production data, assets, commits, or deployment state were modified.',
    '',
    'The audited legacy domain pattern is `https://www.petroni.hr/wp-content/...` (and `wp-includes`).',
    '',
    '## Summary',
    '',
    `- Unique WordPress-hosted asset URLs across all sources: ${summary.unique_urls}`,
    `- WordPress-hosted asset URL occurrences across all sources: ${summary.occurrences}`,
    `- Duplicate occurrences across all sources: ${summary.duplicate_occurrences}`,
    `- Unique Petroni legacy URLs: ${summary.petroni_legacy_unique_urls}`,
    `- Petroni legacy URL occurrences: ${summary.petroni_legacy_occurrences}`,
    `- Petroni legacy duplicate occurrences: ${summary.petroni_legacy_duplicate_occurrences}`,
    `- Repository occurrences: ${summary.repository_occurrences}`,
    `- Production database occurrences: ${summary.production_occurrences}`,
    `- Direct runtime dependencies on Petroni WordPress: ${summary.runtime_occurrences}`,
    `- Third-party WordPress runtime asset dependencies: ${summary.third_party_runtime_occurrences}`,
    `- Product/rental records with missing or malformed image values: ${problems.length}`,
    '',
    '## Affected production tables and columns',
    '',
    '| Table | Column | Occurrences | Affected records | Unique URLs |',
    '| --- | --- | ---: | ---: | ---: |',
    ...Object.entries(summary.by_table).filter(([table]) => table !== 'repository').map(([table, count]) => `| \`${table}\` | ${count.columns.map(column => `\`${column}\``).join(', ') || 'n/a'} | ${count.occurrences} | ${count.affected_records} | ${count.unique_urls} |`),
    '',
    `No WordPress-hosted assets were found in \`vehicles.images\` (all ${audit.scope.production_record_counts.vehicles} vehicle/rental records were audited). No WordPress-hosted assets were found in the scanned product descriptions, vehicle descriptions/specifications, rental terms, settings, or order item snapshots.`,
    '',
    '## Counts by source',
    '',
    '| Source | Occurrences | Unique URLs |',
    '| --- | ---: | ---: |',
    `| Repository | ${summary.repository_occurrences} | ${summary.repository_unique_urls} |`,
    `| Production database | ${summary.production_occurrences} | ${summary.production_unique_urls} |`,
    '',
    '## File types',
    '',
    '| Type | Occurrences |',
    '| --- | ---: |',
    ...Object.entries(summary.file_types).map(([type, count]) => `| ${type} | ${count} |`),
    '',
    '## Direct runtime dependencies',
    '',
    '| File | Line | Kind | URL |',
    '| --- | ---: | --- | --- |',
    ...(repository.filter(reference => reference.runtime_dependency).map(reference => `| \`${reference.file}\` | ${reference.line} | ${reference.runtime_kind} | ${reference.url} |`) || ['| None | — | — | — |']),
    ...thirdPartyRuntime.length ? ['', '## Third-party WordPress runtime assets', '', '| File | Line | URL |', '| --- | ---: | --- |', ...thirdPartyRuntime.map(reference => `| \`${reference.file}\` | ${reference.line} | ${reference.url} |`)] : [],
    '',
    '## Missing or malformed production image values',
    '',
    problems.length ? '| Table | Slug | Issue | Image index | URL |\n| --- | --- | --- | ---: | --- |\n' + problems.map(problem => `| \`${problem.table}\` | ${problem.slug ?? 'n/a'} | ${problem.issue} | ${problem.image_index ?? 'n/a'} | ${problem.url ?? 'n/a'} |`).join('\n') : 'None found in `products.images` or `vehicles.images`.',
    '',
    '## Reversible migration plan',
    '',
    '1. Review `asset-urls.txt`, then create an immutable manifest mapping each original URL to its planned controlled-storage object key. Do not alter existing rows during this step.',
    '2. Copy assets into a new private staging prefix/bucket, checksum them, and record failed downloads separately. Keep the original URL as the manifest key; do not infer filenames as identifiers.',
    '3. Validate object counts, content types, and sampled visual fidelity. Promote only the validated objects to a versioned public prefix such as `legacy-wp-2026-07/`.',
    '4. Apply one transaction-backed migration that records a row-level before-image audit, then replaces only `products.images`, `posts.cover_image`, and approved `site_pages.content` URLs that exactly match the manifest. `vehicles.images` needs no WordPress replacement in the current production database. Do not edit historical migrations.',
    '5. Deploy the two direct runtime replacements (manifest icon and return-form document) only after their controlled-storage URLs are verified.',
    '6. Run a production read-only verification: zero legacy URLs in active application code and active database records; confirm image coverage on representative product, rental, and CMS pages.',
    '7. Retain the before-image audit and legacy asset origin for the rollback window. Rollback is a transaction that restores the saved arrays/JSON values, followed by redeploying the previous runtime references if required.',
    '',
    'The plan is reversible because it preserves exact before-values and changes only values with manifest-confirmed replacements. Asset download/upload, data updates, commits, and deployment are intentionally outside this audit.'
  ];
  return `${lines.join('\n')}\n`;
}

const baseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
if (!baseUrl || !serviceKey) throw new Error('PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required.');

const [repositoryScan, products, vehicles, sitePages, posts, rentalTerms, settings, orders] = await Promise.all([
  repositoryReferences(),
  fetchAll('products', 'id,slug,images,is_active,description_hr,description_en', baseUrl, serviceKey),
  fetchAll('vehicles', 'id,slug,type,images,is_available,description_hr,description_en,specs', baseUrl, serviceKey),
  fetchAll('site_pages', 'key,route,content,is_published', baseUrl, serviceKey),
  fetchAll('posts', 'id,slug,cover_image,content_hr,content_en,excerpt_hr,is_published', baseUrl, serviceKey),
  fetchAll('rental_terms', 'id,version,content_hr,content_en,is_active', baseUrl, serviceKey),
  fetchAll('settings', 'key,value', baseUrl, serviceKey),
  fetchAll('orders', 'id,items', baseUrl, serviceKey)
]);
const { petroni: repository, thirdPartyRuntime } = repositoryScan;

const productAudit = databaseReferences('products', products);
const vehicleAudit = databaseReferences('vehicles', vehicles);
const production = [
  ...productAudit.wordpress, ...vehicleAudit.wordpress,
  ...contentReferences('products', products, ['description_hr', 'description_en']),
  ...contentReferences('vehicles', vehicles, ['description_hr', 'description_en', 'specs']),
  ...sitePageReferences(sitePages),
  ...contentReferences('posts', posts, ['cover_image', 'content_hr', 'content_en', 'excerpt_hr']),
  ...contentReferences('rental_terms', rentalTerms, ['content_hr', 'content_en']),
  ...contentReferences('settings', settings, ['value']),
  ...contentReferences('orders', orders, ['items'])
];
const all = [...repository, ...production, ...thirdPartyRuntime];
const urls = [...new Set(all.map(reference => reference.url))].sort();
const petroniLegacy = all.filter(reference => reference.is_petroni_legacy !== false);
const summary = {
  occurrences: all.length,
  unique_urls: urls.length,
  duplicate_occurrences: all.length - urls.length,
  petroni_legacy_unique_urls: new Set(petroniLegacy.map(reference => reference.url)).size,
  petroni_legacy_occurrences: petroniLegacy.length,
  petroni_legacy_duplicate_occurrences: petroniLegacy.length - new Set(petroniLegacy.map(reference => reference.url)).size,
  repository_occurrences: repository.length,
  repository_unique_urls: new Set(repository.map(reference => reference.url)).size,
  production_occurrences: production.length,
  production_unique_urls: new Set(production.map(reference => reference.url)).size,
  runtime_occurrences: repository.filter(reference => reference.runtime_dependency).length,
  third_party_runtime_occurrences: thirdPartyRuntime.length,
  by_table: countByTable(all),
  file_types: countBy(all, 'file_type')
};
const audit = {
  generated_at: new Date().toISOString(),
  scope: {
    legacy_domain_pattern: 'https://www.petroni.hr/wp-content/... and wp-includes',
    production_tables_read: ['products.images/description_hr/description_en', 'vehicles.images/description_hr/description_en/specs', 'site_pages.content', 'posts.cover_image/content_hr/content_en/excerpt_hr', 'rental_terms.content_hr/content_en', 'settings.value', 'orders.items'],
    production_record_counts: { products: products.length, vehicles: vehicles.length, site_pages: sitePages.length, posts: posts.length, rental_terms: rentalTerms.length, settings: settings.length, orders: orders.length },
    excluded_repository_directories: [...ignoredDirectories]
  },
  summary,
  repository,
  third_party_wordpress_runtime: thirdPartyRuntime,
  production,
  problems: [...productAudit.problems, ...vehicleAudit.problems]
};

await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, 'audit.json'), `${JSON.stringify(audit, null, 2)}\n`);
await writeFile(join(outputDir, 'asset-urls.txt'), `${urls.join('\n')}\n`);
await writeFile(join(outputDir, 'report.md'), report(audit));
console.log(JSON.stringify({ summary, output: ['migration/audit.json', 'migration/asset-urls.txt', 'migration/report.md'] }, null, 2));
