import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const newExport = '/Users/mijomajic/Downloads/wc-product-export-31-7-2026-1785484571060.csv';
const previousExport = resolve(root, '../Petroni files/Petroni.hr/wc-product-export-7-7-2026-1783420118832.csv');
const assetManifestPath = resolve(root, 'migration/woocommerce-catalogue-2026-07-31-asset-manifest.json');
const apply = process.argv.includes('--apply');

function parseEnvironment(source) {
  return Object.fromEntries(source.split(/\r?\n/)
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    }));
}

function parseCsv(source) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else quoted = false;
      } else cell += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') {
      row.push(cell);
      cell = '';
    } else if (character === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else cell += character;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.map(record => Object.fromEntries(headers.map((header, index) => [header.replace(/^\uFEFF/, ''), record[index] ?? ''])));
}

function normalize(value) {
  return value.replace(/\r\n/g, '\n').trim();
}

function sourceStock(row) {
  const quantity = Number.parseInt(normalize(row.Zalihe), 10);
  if (Number.isInteger(quantity) && quantity >= 0) return quantity;
  return normalize(row['Na zalihi?']) === '1' ? 1 : 0;
}

function sourcePrice(row) {
  const price = Number(normalize(row['Normalna cijena']).replace(',', '.'));
  if (!Number.isFinite(price)) throw new Error(`Missing or invalid regular price for SKU ${row.SKU}.`);
  return price;
}

function htmlToText(value) {
  const input = normalize(value);
  if (!input) return null;
  return input
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim() || null;
}

function sourceDescription(row) {
  return htmlToText(row.Opis) ?? htmlToText(row['Kratak opis']);
}

function isPublic(row) {
  return normalize(row.Objavljeno) === '1' && normalize(row['Vidljivost u katalogu']) === 'visible';
}

function sourceCategoryPath(row) {
  return normalize(row.Kategorije).split(',').map(item => item.trim()).find(Boolean) ?? null;
}

function slugify(value) {
  return value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function publicAssetUrl(baseUrl, bucket, key) {
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

async function getAll(client, table, select, orderBy = 'id') {
  const result = [];
  for (let start = 0; ; start += 1000) {
    let query = client.from(table).select(select);
    if (orderBy) query = query.order(orderBy);
    const { data, error } = await query.range(start, start + 999);
    if (error) throw error;
    result.push(...(data ?? []));
    if ((data ?? []).length < 1000) return result;
  }
}

async function concurrent(items, maximum, operation) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(maximum, items.length) }, async () => {
    while (cursor < items.length) await operation(items[cursor++]);
  }));
}

const [environmentSource, newExportSource, previousExportSource, assetManifestSource] = await Promise.all([
  readFile(resolve(root, '.env'), 'utf8'),
  readFile(newExport, 'utf8'),
  readFile(previousExport, 'utf8'),
  readFile(assetManifestPath, 'utf8')
]);
const environment = parseEnvironment(environmentSource);
const client = createClient(environment.PUBLIC_SUPABASE_URL, environment.SUPABASE_SERVICE_KEY);
const nextRows = parseCsv(newExportSource);
const previousRows = parseCsv(previousExportSource);
const manifest = JSON.parse(assetManifestSource);

const [products, categories, reservations] = await Promise.all([
  getAll(client, 'products', 'id,slug,sku,name_hr,description_hr,price,stock,is_active,category_id,images'),
  getAll(client, 'product_categories', 'id,name_hr,parent_id'),
  getAll(client, 'shop_stock_reservations', 'product_id,quantity,status', null)
]);

if (reservations.some(reservation => reservation.status === 'active')) {
  throw new Error('Active shop stock reservations exist. Re-run after checking their quantities against the source export.');
}

const categoryById = new Map(categories.map(category => [category.id, category]));
const categoryByPath = new Map(categories.map(category => {
  const parent = category.parent_id ? categoryById.get(category.parent_id) : null;
  return [parent ? `${parent.name_hr} > ${category.name_hr}` : category.name_hr, category];
}));
const productBySku = new Map(products.filter(product => product.sku).map(product => [product.sku, product]));
const productByName = new Map(products.map(product => [product.name_hr, product]));
const previousById = new Map(previousRows.map(row => [normalize(row.ID), row]));
const previousIdBySku = new Map(previousRows.filter(row => normalize(row.SKU)).map(row => [normalize(row.SKU), normalize(row.ID)]));
const nextIds = new Set(nextRows.map(row => normalize(row.ID)));
const usedSlugs = new Set(products.map(product => product.slug));
const updates = [];
const inserts = [];
const unmatchedCategories = [];
const replacementSkus = [];

for (const row of nextRows) {
  const sku = normalize(row.SKU);
  if (!sku && !isPublic(row)) continue;
  const label = sku || `WooCommerce ID ${normalize(row.ID)}`;

  const categoryPath = sourceCategoryPath(row);
  const category = categoryPath ? categoryByPath.get(categoryPath) : null;
  if (!category) {
    unmatchedCategories.push({ sku: label, categoryPath });
    continue;
  }

  const previous = previousById.get(normalize(row.ID));
  const existing = productBySku.get(sku)
    ?? (previous ? productBySku.get(normalize(previous.SKU)) ?? productByName.get(normalize(previous.Naziv)) : undefined)
    ?? (!sku ? productByName.get(normalize(row.Naziv)) : undefined);
  const payload = {
    name_hr: normalize(row.Naziv),
    description_hr: sourceDescription(row),
    price: sourcePrice(row),
    stock: sourceStock(row),
    is_active: isPublic(row),
    category_id: category.id
  };
  if (sku) payload.sku = sku;

  if (existing) {
    const changes = {};
    if (Number(existing.stock) !== payload.stock) changes.stock = payload.stock;
    if (Number(existing.price) !== payload.price) changes.price = payload.price;
    if (existing.is_active !== payload.is_active) changes.is_active = payload.is_active;
    if (sku && existing.sku !== payload.sku) changes.sku = payload.sku;

    // Keep the initial import's category-selection and text-conversion rules intact.
    // Only source changes since that import update those fields; price and stock are
    // always reconciled against the live value because this export is authoritative.
    if (!previous || normalize(previous.Naziv) !== payload.name_hr) {
      if (existing.name_hr !== payload.name_hr) changes.name_hr = payload.name_hr;
    }
    if (!previous || sourceDescription(previous) !== payload.description_hr) {
      if (existing.description_hr !== payload.description_hr) changes.description_hr = payload.description_hr;
    }
    if (!previous || sourceCategoryPath(previous) !== categoryPath) {
      if (existing.category_id !== payload.category_id) changes.category_id = payload.category_id;
    }
    if (Object.keys(changes).length) updates.push({ id: existing.id, sku, changes, preserveImages: true });
    if (sku && existing.sku !== sku) replacementSkus.push({ from: existing.sku, to: sku, id: existing.id });
    continue;
  }

  const originalImages = normalize(row.Slike).split(',').map(url => url.trim()).filter(Boolean);
  const images = originalImages.map(url => {
    const asset = manifest.assets[url];
    if (asset?.upload_result?.status !== 'uploaded' && asset?.upload_result?.status !== 'already_present_checksum_match') {
      throw new Error(`New product ${label} has no uploaded asset for ${url}.`);
    }
    return publicAssetUrl(environment.PUBLIC_SUPABASE_URL, manifest.configuration.bucket, asset.object_key);
  });
  let slug = slugify(payload.name_hr);
  if (!slug) slug = `product-${sku.toLowerCase() || normalize(row.ID)}`;
  if (usedSlugs.has(slug)) slug = `${slug}-${sku.toLowerCase() || normalize(row.ID)}`;
  if (usedSlugs.has(slug)) throw new Error(`Could not create a unique slug for new product ${label}.`);
  usedSlugs.add(slug);
  inserts.push({ ...payload, slug, images, sku: sku || null });
}

for (const product of products) {
  const previousId = product.sku ? previousIdBySku.get(product.sku) : null;
  if (previousId && !nextIds.has(previousId) && product.is_active) {
    updates.push({ id: product.id, sku: product.sku, changes: { is_active: false }, preserveImages: true });
  }
}

if (unmatchedCategories.length) {
  throw new Error(`Could not match ${unmatchedCategories.length} source categories: ${JSON.stringify(unmatchedCategories.slice(0, 10))}`);
}

const fields = updates.reduce((counts, update) => {
  for (const key of Object.keys(update.changes)) counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});
const fieldSamples = Object.fromEntries(Object.keys(fields).map(field => [field, updates
  .filter(update => field in update.changes)
  .slice(0, 5)
  .map(update => ({ sku: update.sku, value: update.changes[field] }))]));
const summary = {
  mode: apply ? 'apply' : 'dry_run',
  source_rows: nextRows.length,
  existing_updates: updates.length,
  new_products: inserts.length,
  fields,
  sku_replacements: replacementSkus.length,
  deactivated_missing_products: updates.filter(update => Object.keys(update.changes).length === 1 && update.changes.is_active === false).length,
  existing_product_images_changed: 0,
  new_product_images_added: inserts.reduce((count, product) => count + product.images.length, 0)
};

if (apply) {
  await concurrent(updates, 12, async update => {
    const { error } = await client.from('products').update(update.changes).eq('id', update.id);
    if (error) throw error;
  });
  await concurrent(inserts, 12, async product => {
    const { error } = await client.from('products').insert(product);
    if (error) throw error;
  });
}

console.log(JSON.stringify({ ...summary, samples: fieldSamples, replacements: replacementSkus }, null, 2));
