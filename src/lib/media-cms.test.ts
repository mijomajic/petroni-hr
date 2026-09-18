import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const projectFile = (...parts: string[]) => resolve(process.cwd(), ...parts);

test('media library keeps originals private and serves a separate public copy', () => {
  const migration = readFileSync(projectFile('supabase/migrations/0043_alderway_media_buckets.sql'), 'utf8');
  const upload = readFileSync(projectFile('src/routes/admin/mediji/+page.server.ts'), 'utf8');
  assert.match(migration, /'alderway-media-originals', 'alderway-media-originals', false/);
  assert.match(migration, /'alderway-media', 'alderway-media', true/);
  assert.match(migration, /Public read Alderway media/);
  assert.match(upload, /imageDimensions\(original, file\.type\)/);
  assert.match(upload, /BUSINESS\.media\.originalsBucket/);
  assert.match(upload, /BUSINESS\.media\.publicBucket/);
  assert.match(upload, /createHash\('sha256'\)/);
  assert.match(upload, /status: 'archived'/);
});

test('content drafts are private, versioned, and require explicit publishing', () => {
  const migration = readFileSync(projectFile('supabase/migrations/0041_phase6hf_content_versions.sql'), 'utf8');
  const pageAdmin = readFileSync(projectFile('src/routes/admin/stranice/[key]/+page.server.ts'), 'utf8');
  const preview = readFileSync(projectFile('src/lib/site-page-preview.server.ts'), 'utf8');
  assert.match(migration, /create table if not exists site_page_versions/);
  assert.match(migration, /create unique index if not exists idx_site_page_versions_one_draft/);
  assert.match(migration, /create table if not exists post_versions/);
  assert.match(pageAdmin, /saveDraft/);
  assert.match(pageAdmin, /publishDraft/);
  assert.match(pageAdmin, /restoreVersion/);
  assert.match(preview, /getAdministrator/);
  assert.match(preview, /throw error\(404/);
});

test('admin cancellation returns committed shop stock but does not imply a card refund', () => {
  const stockMigration = readFileSync(projectFile('supabase/migrations/0015_shop_stock_reservations.sql'), 'utf8');
  const orderStatus = readFileSync(projectFile('src/routes/api/admin/orders/[id]/status/+server.ts'), 'utf8');
  assert.match(stockMigration, /set stock = stock \+ v_reservation\.quantity/);
  assert.match(orderStatus, /cancelOrderAndReleaseStock/);
  assert.doesNotMatch(orderStatus, /refund.*corvus|corvus.*refund/i);
});
