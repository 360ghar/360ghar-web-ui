/**
 * Generate OG image for social sharing from the hero banner asset.
 * Creates a 1200x630 JPG optimized for Open Graph / Twitter Cards.
 */
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'public', 'assets', 'images', 'thumbs', 'banner-three.webp');
const DEST = join(ROOT, 'public', 'og-image-home.jpg');

if (!existsSync(SRC)) {
  console.error('Source image not found:', SRC);
  process.exit(1);
}

await sharp(SRC)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 85, progressive: true })
  .toFile(DEST);

console.log('Generated OG image:', DEST);
