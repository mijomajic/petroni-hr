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
