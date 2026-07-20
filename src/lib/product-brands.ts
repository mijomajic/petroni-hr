export function uniqueProductBrands(rows: Array<{ brand?: string | null }>) {
  const brands = new Map<string, string>();
  for (const row of rows) {
    const brand = row.brand?.trim();
    if (!brand) continue;
    const key = brand.toLocaleLowerCase('hr');
    if (!brands.has(key)) brands.set(key, brand);
  }
  return [...brands.values()].sort((a, b) => a.localeCompare(b, 'hr'));
}

export function orderedFeaturedBrands(available: string[], configured: unknown): string[] {
  const availableByKey = new Map(
    available.map((brand) => [brand.trim().toLocaleLowerCase('hr'), brand.trim()])
  );
  if (!Array.isArray(configured)) return [];

  const featured: string[] = [];
  const seen = new Set<string>();
  for (const item of configured) {
    const key = String(item ?? '').trim().toLocaleLowerCase('hr');
    const brand = availableByKey.get(key);
    if (!brand || seen.has(key)) continue;
    featured.push(brand);
    seen.add(key);
  }
  return featured;
}
