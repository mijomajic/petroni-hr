import { createHash } from 'node:crypto';
import { readdir, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = path.resolve(projectRoot, '..');
const outputRoot = path.join(projectRoot, 'static', 'images', 'vehicles');

const collections = [
  { key: 'roller-team-kronos-277m', source: 'Slike 1.dio/Kronos', first: 'izvana.jpg' },
  { key: 'ci-horon-79m', source: 'Slike 1.dio/Horon', first: 'HORON_79_1.jpg' },
  { key: 'mclouis-mc4-873', source: 'Slike 1.dio/McLouis', first: 'izvana.jpg' },
  { key: 'rimor-kilig-50', source: 'Slike 1.dio/Kilig 50', first: 'K50-3.jpg' },
  { key: 'rimor-evo-sound', source: 'Slike 1.dio/Evo Sound', first: 'RIMOR_EVO_1.jpg' },
  { key: 'caratour-ford-600mq', source: 'Slike 1.dio/CaraTour', first: '1-caratour.webp' },
  { key: 'knaus-boxdrive-680me', source: 'Slike 1.dio/BoxDrive', first: 'MAN_1.jpg' },
  { key: 'petrovan-53-4x4', source: 'Slike vozila 2.dio/PetroVan', first: 'VW_TRANSPORTER_1.jpg' },
  { key: 'budget-van-55', source: 'Slike vozila 2.dio/BudgetVan', first: 'image1-1-1.jpeg' },
  { key: 'weinsberg-caraone-550uk', source: 'Slike vozila 2.dio/550UK', first: 'CO550UK-1.jpg' },
  { key: 'weinsberg-caraone-550qdk', source: 'Slike vozila 2.dio/550QDK', first: 'CO550QDK-2.jpg' },
  { key: 'citroen-unitvan', source: 'Slike vozila 2.dio/UnitVan film', first: 'WhatsApp-Image-2024-06-06-at-13.56.52-4.jpeg' },
  { key: 'honeywagon-vacum-jet-1', source: 'Slike vozila 2.dio/WC 1+1', first: 'IMG_20210317_122924.jpg' },
  { key: 'honeywagon-vacum-jet-2', source: 'Slike vozila 2.dio/WC 2+1+1', first: 'IMG_20211027_072938-scaled.jpg' },
  { key: 'kamion-eurocargo-75e15', source: 'Slike vozila 2.dio/EuroCargo film', first: '1620536604309.jpg' },
  { key: 'make-up-truck-peugeot-boxer', source: 'Slike vozila 2.dio/Boxer makeup film', first: 'PEUGEOT_SMINKA_1.jpg' },
  { key: 'costume-truck-renault-master', source: 'Slike vozila 2.dio/Costume Master Film', first: 'RENAULT_1.jpg' },
  { key: 'make-up-van-iveco-daily-irisbus', source: 'Slike vozila 2.dio/IrisBus Film', first: 'IMG_20210716_174453-scaled.jpg' },
  { key: 'gully-sucker-iveco-daily-35c15', source: 'Slike vozila 2.dio/GullySucker film', first: 'GS-2.jpg' },
  { key: 'weinsberg-caracompact-suite-640meq', source: 'Slike vozila 2.dio/Pepper PRODAJA', first: '3300_CaraCompact_Suite_Pepper_MB-640MEG_EXBP_Presse_8616.jpg' }
];

function safeName(filename) {
  return path.parse(filename).name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'image';
}

function sortFiles(files, first) {
  return files.sort((a, b) => {
    if (a === first) return -1;
    if (b === first) return 1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
}

async function optimizeCollection(collection) {
  const sourceDir = path.join(workspaceRoot, collection.source);
  const outputDir = path.join(outputRoot, collection.key);
  await mkdir(outputDir, { recursive: true });

  const entries = await readdir(sourceDir, { withFileTypes: true });
  const files = sortFiles(entries.filter((entry) => entry.isFile() && entry.name.toLowerCase() !== 'logo ci.pdf').map((entry) => entry.name), collection.first);
  const seenHashes = new Set();
  const images = [];
  let position = 0;

  for (const filename of files) {
    const sourcePath = path.join(sourceDir, filename);
    const source = await readFile(sourcePath);
    const hash = createHash('sha256').update(source).digest('hex');
    if (seenHashes.has(hash)) continue;

    try {
      await sharp(source).metadata();
    } catch {
      console.warn(`Skipping unsupported file: ${collection.source}/${filename}`);
      continue;
    }

    seenHashes.add(hash);
    position += 1;
    const stem = `${String(position).padStart(2, '0')}-${safeName(filename)}`;
    const fullName = `${stem}.webp`;
    const thumbName = `${stem}-thumb.webp`;

    await Promise.all([
      sharp(source)
        .rotate()
        .resize({ width: 1440, height: 1080, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 76, effort: 6, smartSubsample: true })
        .toFile(path.join(outputDir, fullName)),
      sharp(source)
        .rotate()
        .resize({ width: 480, height: 360, fit: 'cover', position: 'attention', withoutEnlargement: false })
        .webp({ quality: 74, effort: 5, smartSubsample: true })
        .toFile(path.join(outputDir, thumbName))
    ]);

    images.push(`/images/vehicles/${collection.key}/${fullName}`);
  }

  console.log(`${collection.key}: ${images.length} images`);
  return [collection.key, images];
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const manifest = Object.fromEntries(await Promise.all(collections.map(optimizeCollection)));
await writeFile(
  path.join(projectRoot, 'scripts', 'vehicle-image-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.log(`Wrote ${Object.values(manifest).flat().length} optimized gallery images plus thumbnails.`);
