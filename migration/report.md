# WordPress asset dependency audit

Generated: 2026-07-30T15:29:56.915Z

## Scope and method

This is a read-only audit. It scanned repository text files (excluding generated/dependency directories) and queried the production Supabase REST API with read-only `select` requests. No production data, assets, commits, or deployment state were modified.

The audited legacy domain pattern is `https://www.petroni.hr/wp-content/...` (and `wp-includes`).

## Summary

- Unique WordPress-hosted asset URLs across all sources: 3214
- WordPress-hosted asset URL occurrences across all sources: 6929
- Duplicate occurrences across all sources: 3715
- Unique Petroni legacy URLs: 3213
- Petroni legacy URL occurrences: 6927
- Petroni legacy duplicate occurrences: 3714
- Repository occurrences: 3489
- Production database occurrences: 3439
- Direct runtime dependencies on Petroni WordPress: 2
- Third-party WordPress runtime asset dependencies: 1
- Product/rental records with missing or malformed image values: 0

## Affected production tables and columns

| Table | Column | Occurrences | Affected records | Unique URLs |
| --- | --- | ---: | ---: | ---: |
| `products` | `images` | 3431 | 2178 | 3183 |
| `site_pages` | `content` | 2 | 1 | 2 |
| `posts` | `cover_image` | 6 | 6 | 3 |

No WordPress-hosted assets were found in `vehicles.images` (all 23 vehicle/rental records were audited). No WordPress-hosted assets were found in the scanned product descriptions, vehicle descriptions/specifications, rental terms, settings, or order item snapshots.

## Counts by source

| Source | Occurrences | Unique URLs |
| --- | ---: | ---: |
| Repository | 3489 | 3212 |
| Production database | 3439 | 3188 |

## File types

| Type | Occurrences |
| --- | ---: |
| avif | 4 |
| jpeg | 667 |
| jpg | 5989 |
| pdf | 2 |
| png | 239 |
| webp | 28 |

## Direct runtime dependencies

| File | Line | Kind | URL |
| --- | ---: | --- | --- |
| `src/routes/reklamacije-povrat/+page.svelte` | 68 | document link | https://www.petroni.hr/wp-content/uploads/2024/02/POVRAT-ROBE-PETRONI.pdf |
| `static/site.webmanifest` | 11 | manifest icon | https://www.petroni.hr/wp-content/uploads/2024/03/cropped-Group-3-270x270.jpg |

## Third-party WordPress runtime assets

| File | Line | URL |
| --- | ---: | --- |
| `src/lib/site-page-content.ts` | 93 | https://campingplitvice.hr/wp-content/uploads/2019/08/campingplitvice_logo.png |

## Missing or malformed production image values

None found in `products.images` or `vehicles.images`.

## Reversible migration plan

1. Review `asset-urls.txt`, then create an immutable manifest mapping each original URL to its planned controlled-storage object key. Do not alter existing rows during this step.
2. Copy assets into a new private staging prefix/bucket, checksum them, and record failed downloads separately. Keep the original URL as the manifest key; do not infer filenames as identifiers.
3. Validate object counts, content types, and sampled visual fidelity. Promote only the validated objects to a versioned public prefix such as `legacy-wp-2026-07/`.
4. Apply one transaction-backed migration that records a row-level before-image audit, then replaces only `products.images`, `posts.cover_image`, and approved `site_pages.content` URLs that exactly match the manifest. `vehicles.images` needs no WordPress replacement in the current production database. Do not edit historical migrations.
5. Deploy the two direct runtime replacements (manifest icon and return-form document) only after their controlled-storage URLs are verified.
6. Run a production read-only verification: zero legacy URLs in active application code and active database records; confirm image coverage on representative product, rental, and CMS pages.
7. Retain the before-image audit and legacy asset origin for the rollback window. Rollback is a transaction that restores the saved arrays/JSON values, followed by redeploying the previous runtime references if required.

The plan is reversible because it preserves exact before-values and changes only values with manifest-confirmed replacements. Asset download/upload, data updates, commits, and deployment are intentionally outside this audit.
