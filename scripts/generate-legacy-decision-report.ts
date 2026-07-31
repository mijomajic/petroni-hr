import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { CURRENT_PUBLIC_PATHS, legacyRedirectDecision } from '../src/lib/legacy-redirects';

type SitemapSnapshot = {
  captured_on: string;
  sitemaps: Array<{ name: string; urls: string[] }>;
};

function csv(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

const root = process.cwd();
const auditDate = process.env.LEGACY_AUDIT_DATE ?? new Date().toISOString().slice(0, 10);
const snapshot = JSON.parse(await readFile(
  resolve(root, `docs/go-live/legacy-wordpress-sitemaps-${auditDate}.json`),
  'utf8'
)) as SitemapSnapshot;
const seen = new Set<string>();
const rows: string[] = [];
const counts = { current: 0, redirect: 0, gone: 0 };

for (const sitemap of snapshot.sitemaps) {
  for (const rawValue of sitemap.urls) {
    const sourceUrl = rawValue.replaceAll('&amp;', '&');
    if (seen.has(sourceUrl)) continue;
    seen.add(sourceUrl);

    const url = new URL(sourceUrl);
    const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
    const decision = legacyRedirectDecision(path, url.searchParams);
    let status: number;
    let target = '';
    let locale = '';
    let reason = '';

    if (!decision && CURRENT_PUBLIC_PATHS.has(path)) {
      status = 200;
      target = path;
      counts.current += 1;
    } else if (decision?.status === 308) {
      status = 308;
      const destination = new URL(decision.target, 'https://www.petroni.hr');
      if (decision.locale) destination.searchParams.set('lang', decision.locale);
      target = `${destination.pathname}${destination.search}`;
      locale = decision.locale ?? '';
      counts.redirect += 1;
    } else if (decision?.status === 410) {
      status = 410;
      reason = decision.reason;
      counts.gone += 1;
    } else {
      throw new Error(`Unmapped legacy URL: ${sourceUrl}`);
    }

    rows.push([
      sitemap.name,
      sourceUrl,
      status,
      target,
      locale,
      reason
    ].map(csv).join(','));
  }
}

const destination = resolve(root, `docs/go-live/legacy-url-decisions-${auditDate}.csv`);
await writeFile(destination, [
  'source_sitemap,source_url,status,target,locale,reason',
  ...rows
].join('\n') + '\n');

console.log(JSON.stringify({ destination, unique_urls: rows.length, counts }, null, 2));
