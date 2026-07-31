import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DEFAULT_LEGAL_DOCUMENTS,
  isLegalDocumentKey,
  LEGAL_DOCUMENT_DEFINITIONS,
  LEGAL_DOCUMENT_KEYS
} from './legal-documents';
import { renderTermsMarkup } from './terms-markup';

const projectFile = (path: string) => new URL(`../../${path}`, import.meta.url);

test('all five legal documents have unique routes and complete HR/EN baseline content', () => {
  assert.equal(LEGAL_DOCUMENT_KEYS.length, 5);
  const routes = LEGAL_DOCUMENT_KEYS.map((key) => LEGAL_DOCUMENT_DEFINITIONS[key].route);
  assert.equal(new Set(routes).size, routes.length);
  for (const key of LEGAL_DOCUMENT_KEYS) {
    const document = DEFAULT_LEGAL_DOCUMENTS[key];
    assert.equal(document.document_key, key);
    assert.match(document.effective_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(document.title_hr.length >= 3);
    assert.ok(document.title_en.length >= 3);
    assert.ok(document.content_hr.length >= 50);
    assert.ok(document.content_en.length >= 50);
  }
});

test('legal document keys reject prototype and unknown values', () => {
  assert.equal(isLegalDocumentKey('privacy'), true);
  assert.equal(isLegalDocumentKey('__proto__'), false);
  assert.equal(isLegalDocumentKey('toString'), false);
});

test('legal Markdown rendering escapes administrator-supplied HTML', () => {
  const html = renderTermsMarkup('## Naslov\n\n<script>alert(1)</script>\n\n- **Sigurna stavka**');
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /<strong>Sigurna stavka<\/strong>/);
});

test('fonts and language flags are local and BoxNow is loaded only by an explicit action', () => {
  const appHtml = readFileSync(projectFile('src/app.html'), 'utf8');
  const header = readFileSync(projectFile('src/lib/components/layout/Header.svelte'), 'utf8');
  const checkout = readFileSync(projectFile('src/routes/checkout/+page.svelte'), 'utf8');
  assert.doesNotMatch(appHtml, /fonts\.(?:googleapis|gstatic)\.com/);
  assert.doesNotMatch(header, /flagcdn\.com/);
  assert.match(header, /\/flags\/hr\.svg/);
  assert.match(header, /\/flags\/gb\.svg/);
  assert.ok(existsSync(projectFile('static/flags/hr.svg')));
  assert.ok(existsSync(projectFile('static/flags/gb.svg')));
  assert.ok(existsSync(projectFile('static/fonts/poppins/poppins-400-latin-ext.woff2')));

  const loaderStart = checkout.indexOf('function openBoxNowMap()');
  const externalScript = checkout.indexOf('https://widget-cdn.boxnow.hr/map-widget/client/v5.js');
  assert.ok(loaderStart >= 0 && externalScript > loaderStart);
  assert.doesNotMatch(checkout, /onMount\(\(\) => \{\s*const partnerId/);
});

test('migration restricts legal writes and provides draft, publish and restore operations', () => {
  const migration = readFileSync(projectFile('supabase/migrations/0038_phase6h_legal_documents.sql'), 'utf8');
  assert.match(migration, /create or replace function save_legal_document_draft/);
  assert.match(migration, /create or replace function publish_legal_document_version/);
  assert.match(migration, /create or replace function restore_legal_document_version/);
  assert.match(migration, /revoke all on function save_legal_document_draft[\s\S]+from public, anon, authenticated/);
  assert.match(migration, /where status = 'draft'/);
  assert.match(migration, /where status = 'published'/);
});
