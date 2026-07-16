export function vehicleThumbnail(image: string | null | undefined) {
  if (!image) return undefined;
  if (!image.startsWith('/images/vehicles/') || image.endsWith('-thumb.webp')) return image;
  return image.replace(/\.webp$/, '-thumb.webp');
}
