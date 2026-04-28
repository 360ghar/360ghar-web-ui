#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const imagesRoot = path.join(repoRoot, 'public', 'assets', 'images');

const SOURCE_URLS = {
  exteriorHero: 'https://images.pexels.com/photos/34943045/pexels-photo-34943045.jpeg?auto=compress&cs=tinysrgb&w=2000',
  exteriorBalconies: 'https://images.pexels.com/photos/10209711/pexels-photo-10209711.jpeg?auto=compress&cs=tinysrgb&w=2000',
  exteriorStreet: 'https://images.pexels.com/photos/15667589/pexels-photo-15667589.jpeg?auto=compress&cs=tinysrgb&w=2000',
  interiorLiving: 'https://images.pexels.com/photos/33559373/pexels-photo-33559373.jpeg?auto=compress&cs=tinysrgb&w=2000',
  coupleHome: 'https://images.pexels.com/photos/4307799/pexels-photo-4307799.jpeg?auto=compress&cs=tinysrgb&w=2000',
  coupleCouch: 'https://images.pexels.com/photos/4307939/pexels-photo-4307939.jpeg?auto=compress&cs=tinysrgb&w=2000',
  womanOffice: 'https://images.pexels.com/photos/32251449/pexels-photo-32251449.jpeg?auto=compress&cs=tinysrgb&w=1600',
  womanDesk: 'https://images.pexels.com/photos/32252228/pexels-photo-32252228.jpeg?auto=compress&cs=tinysrgb&w=1600',
  manPortrait: 'https://images.pexels.com/photos/1067622/pexels-photo-1067622.jpeg?auto=compress&cs=tinysrgb&w=1200',
  officeTeam: 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1600',
};

const SOURCE_CREDITS = [
  { id: 'exteriorHero', label: 'Apartment exterior', source: 'Pexels 27085225' },
  { id: 'exteriorBalconies', label: 'Balcony facade', source: 'Pexels 10209711' },
  { id: 'exteriorStreet', label: 'Urban apartments', source: 'Pexels 13247091' },
  { id: 'interiorLiving', label: 'Indian interior', source: 'Pexels 33559373' },
  { id: 'coupleHome', label: 'Indian couple at home', source: 'Pexels 4307799' },
  { id: 'coupleCouch', label: 'Indian couple with devices at home', source: 'Pexels 4307939' },
  { id: 'womanOffice', label: 'South Asian businesswoman', source: 'Pexels 32251449' },
  { id: 'womanDesk', label: 'Indian woman at office desk', source: 'Pexels 32252228' },
  { id: 'manPortrait', label: 'South Asian man portrait', source: 'Pexels 1067622' },
  { id: 'officeTeam', label: 'Office team group', source: 'Pexels 3184398' },
];

const COMPETITOR_LOGOS = [
  ['nobroker', 'NoBroker'],
  ['magicbricks', 'MagicBricks'],
  ['99acres', '99acres'],
  ['housing', 'Housing.com'],
  ['commonfloor', 'CommonFloor'],
  ['proptiger', 'PropTiger'],
  ['squareyards', 'Square Yards'],
  ['nestaway', 'NestAway'],
  ['zolo', 'Zolo'],
  ['stanza', 'Stanza Living'],
];

const HERO_RESPONSIVE_WIDTHS = [320, 640, 768, 1024];

const metadataCache = new Map();
const sourceCache = new Map();

function assetPath(...segments) {
  return path.join(imagesRoot, ...segments);
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function fetchSourceBuffer(id) {
  if (sourceCache.has(id)) return sourceCache.get(id);

  const response = await fetch(SOURCE_URLS[id]);
  if (!response.ok) {
    throw new Error(`Failed to download source ${id}: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  sourceCache.set(id, buffer);
  return buffer;
}

async function getExistingMetadata(filePath) {
  if (metadataCache.has(filePath)) return metadataCache.get(filePath);

  const metadata = await sharp(filePath).metadata();
  metadataCache.set(filePath, metadata);
  return metadata;
}

async function writeCoverAsset({ outputPath, sourceId, position = 'centre', formatOptions = {}, size = null }) {
  const sourceBuffer = await fetchSourceBuffer(sourceId);
  let width = size?.width || null;
  let height = size?.height || null;

  if (!width || !height) {
    const metadata = await getExistingMetadata(outputPath);
    width = metadata.width;
    height = metadata.height;
  }

  const ext = path.extname(outputPath).toLowerCase();

  let pipeline = sharp(sourceBuffer).resize(width, height, {
    fit: 'cover',
    position,
  });

  if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: 82, ...formatOptions });
  } else if (ext === '.avif') {
    pipeline = pipeline.avif({ quality: 58, ...formatOptions });
  } else if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: 88, mozjpeg: true, ...formatOptions });
  } else {
    pipeline = pipeline.png({ compressionLevel: 9, ...formatOptions });
  }

  await ensureDir(outputPath);
  await pipeline.toFile(outputPath);
}

async function writeRoundedTransparentAsset({
  outputPath,
  sourceId,
  radius = 24,
  padding = 16,
  shadow = true,
  accent = true,
}) {
  const sourceBuffer = await fetchSourceBuffer(sourceId);
  const metadata = await getExistingMetadata(outputPath);
  const width = metadata.width;
  const height = metadata.height;
  const innerWidth = Math.max(40, width - (padding * 2));
  const innerHeight = Math.max(40, height - (padding * 2));

  const image = await sharp(sourceBuffer)
    .resize(innerWidth, innerHeight, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  const maskSvg = `
    <svg width="${innerWidth}" height="${innerHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${innerWidth}" height="${innerHeight}" rx="${radius}" ry="${radius}" fill="#ffffff" />
    </svg>
  `;

  const masked = await sharp(image)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const shadowSvg = shadow ? `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${padding + 10}" y="${padding + 12}" width="${innerWidth}" height="${innerHeight}" rx="${radius}" ry="${radius}" fill="rgba(18,24,40,0.16)" />
    </svg>
  ` : null;

  const accentSvg = accent ? `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${width - 28}" cy="30" r="14" fill="#ff6b00" fill-opacity="0.9" />
      <path d="M22 ${height - 44} C 48 ${height - 18}, 82 ${height - 14}, 110 ${height - 30}" stroke="#ff6b00" stroke-width="6" fill="none" stroke-linecap="round" />
    </svg>
  ` : null;

  const composite = [];
  if (shadowSvg) composite.push({ input: Buffer.from(shadowSvg) });
  composite.push({ input: masked, top: padding, left: padding });
  if (accentSvg) composite.push({ input: Buffer.from(accentSvg) });

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composite)
    .png()
    .toFile(outputPath);
}

async function writeBannerThreeHero(outputPath) {
  const metadata = await getExistingMetadata(outputPath);
  const width = metadata.width;
  const height = metadata.height;
  const sourceBuffer = await fetchSourceBuffer('exteriorHero');

  const photo = await sharp(sourceBuffer)
    .resize(width - 70, height - 70, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  const clipSvg = `
    <svg width="${width - 70}" height="${height - 70}" viewBox="0 0 ${width - 70} ${height - 70}" xmlns="http://www.w3.org/2000/svg">
      <path d="M160 18 H${width - 230} Q${width - 188} 18 ${width - 162} 56 L${width - 58} ${Math.floor(height / 2) - 12} Q${width - 36} ${Math.floor(height / 2)} ${width - 58} ${Math.floor(height / 2) + 18} L${width - 162} ${height - 126} Q${width - 188} ${height - 88} ${width - 230} ${height - 88} H160 Q118 ${height - 88} 92 ${height - 126} L18 ${Math.floor(height / 2) + 18} Q-6 ${Math.floor(height / 2)} 18 ${Math.floor(height / 2) - 18} L92 56 Q118 18 160 18 Z" fill="#ffffff"/>
    </svg>
  `;

  const masked = await sharp(photo)
    .composite([{ input: Buffer.from(clipSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const frameSvg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <path d="M170 16 H${width - 210} Q${width - 162} 16 ${width - 132} 62 L${width - 38} ${Math.floor(height / 2) - 10} Q${width - 10} ${Math.floor(height / 2)} ${width - 38} ${Math.floor(height / 2) + 20} L${width - 132} ${height - 122} Q${width - 162} ${height - 72} ${width - 210} ${height - 72} H170 Q122 ${height - 72} 92 ${height - 122} L14 ${Math.floor(height / 2) + 20} Q-14 ${Math.floor(height / 2)} 14 ${Math.floor(height / 2) - 20} L92 62 Q122 16 170 16 Z" fill="none" stroke="#ff6b00" stroke-width="18"/>
      <polygon points="${width - 72},54 ${width - 42},54 ${width - 26},82 ${width - 42},110 ${width - 72},110 ${width - 88},82" fill="#ff8c3a"/>
      <polygon points="46,${height - 110} 72,${height - 110} 86,${height - 86} 72,${height - 62} 46,${height - 62} 32,${height - 86}" fill="#ff8c3a"/>
    </svg>
  `;

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: masked, top: 35, left: 35 },
      { input: Buffer.from(frameSvg) },
    ])
    .png()
    .toFile(outputPath);

  const transparentHero = await sharp(outputPath).png().toBuffer();
  await sharp(transparentHero).webp({ quality: 82 }).toFile(outputPath.replace(/\.png$/, '.webp'));

  for (const responsiveWidth of HERO_RESPONSIVE_WIDTHS) {
    await sharp(transparentHero)
      .resize(responsiveWidth)
      .webp({ quality: 80 })
      .toFile(outputPath.replace(/\.png$/, `-${responsiveWidth}w.webp`));
  }
}

async function writeBannerCollage(outputPath, format = 'png') {
  const metadata = await getExistingMetadata(outputPath);
  const width = metadata.width;
  const height = metadata.height;
  const sourceBuffer = await fetchSourceBuffer('exteriorBalconies');

  const baseImage = await sharp(sourceBuffer)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  const panelSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${Math.floor(width * 0.28)}" height="${Math.floor(height * 0.32)}" rx="46" fill="#ffffff"/>
      <rect x="${Math.floor(width * 0.33)}" y="0" width="${Math.floor(width * 0.33)}" height="${Math.floor(height * 0.32)}" rx="46" fill="#ffffff"/>
      <rect x="${Math.floor(width * 0.68)}" y="0" width="${Math.floor(width * 0.32)}" height="${Math.floor(height * 0.32)}" rx="46" fill="#ffffff"/>
      <rect x="0" y="${Math.floor(height * 0.36)}" width="${Math.floor(width * 0.28)}" height="${Math.floor(height * 0.32)}" rx="46" fill="#ffffff"/>
      <rect x="${Math.floor(width * 0.33)}" y="${Math.floor(height * 0.32)}" width="${Math.floor(width * 0.50)}" height="${Math.floor(height * 0.50)}" rx="46" fill="#ffffff"/>
      <rect x="${Math.floor(width * 0.72)}" y="${Math.floor(height * 0.36)}" width="${Math.floor(width * 0.28)}" height="${Math.floor(height * 0.32)}" rx="28" fill="#ffffff"/>
      <rect x="0" y="${Math.floor(height * 0.68)}" width="${Math.floor(width * 0.28)}" height="${Math.floor(height * 0.32)}" rx="46" fill="#ffffff"/>
      <circle cx="${Math.floor(width * 0.83)}" cy="${Math.floor(height * 0.84)}" r="${Math.floor(width * 0.14)}" fill="#ffffff"/>
    </svg>
  `;

  const masked = await sharp(baseImage)
    .composite([{ input: Buffer.from(panelSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const accentSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${Math.floor(width * 0.74)}" y="${Math.floor(height * 0.67)}" font-family="Georgia, serif" font-size="${Math.floor(width * 0.1)}" fill="#ff6b00">“</text>
      <path d="M${Math.floor(width * 0.24)} ${Math.floor(height * 0.95)} C ${Math.floor(width * 0.28)} ${Math.floor(height * 1.02)}, ${Math.floor(width * 0.35)} ${Math.floor(height * 1.02)}, ${Math.floor(width * 0.39)} ${Math.floor(height * 0.94)}" stroke="#ff6b00" stroke-width="6" fill="none" stroke-linecap="round" />
    </svg>
  `;

  let pipeline = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([
    { input: masked },
    { input: Buffer.from(accentSvg) },
  ]);

  if (format === 'webp') {
    pipeline = pipeline.webp({ quality: 82 });
  } else {
    pipeline = pipeline.png();
  }

  await pipeline.toFile(outputPath);
}

async function writeCompetitorLogos() {
  const competitorsDir = assetPath('competitors');
  await fs.mkdir(competitorsDir, { recursive: true });

  for (const [slug, label] of COMPETITOR_LOGOS) {
    const logoSvg = `
      <svg width="240" height="80" viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${slug}-title">
        <title id="${slug}-title">${label}</title>
        <rect x="2" y="2" width="236" height="76" rx="18" fill="#fff5eb" stroke="#ff6b00" stroke-width="4" />
        <circle cx="34" cy="40" r="14" fill="#ff6b00" />
        <text x="60" y="49" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#181616">${label}</text>
      </svg>
    `;

    await fs.writeFile(path.join(competitorsDir, `${slug}.svg`), `${logoSvg}\n`, 'utf8');
  }
}

async function writeSourceCredits() {
  const creditsPath = path.join(repoRoot, 'docs', 'image-refresh-sources.json');
  await fs.writeFile(`${creditsPath}`, `${JSON.stringify(SOURCE_CREDITS, null, 2)}\n`, 'utf8');
}

async function main() {
  await writeCompetitorLogos();

  await writeBannerThreeHero(assetPath('thumbs', 'banner-three.png'));
  await writeBannerCollage(assetPath('thumbs', 'banner-img.png'), 'png');
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'banner-img.webp'),
    sourceId: 'exteriorBalconies',
  });

  await writeRoundedTransparentAsset({
    outputPath: assetPath('thumbs', 'about-three-img.png'),
    sourceId: 'coupleCouch',
    padding: 14,
    radius: 26,
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'about-three-img.webp'),
    sourceId: 'coupleCouch',
  });

  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'about-img.png'),
    sourceId: 'exteriorStreet',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'about-img.webp'),
    sourceId: 'exteriorStreet',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'about-two-img.png'),
    sourceId: 'interiorLiving',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'about-two-img.webp'),
    sourceId: 'interiorLiving',
  });

  await writeRoundedTransparentAsset({
    outputPath: assetPath('thumbs', 'cta-img.png'),
    sourceId: 'coupleCouch',
    padding: 12,
    radius: 30,
  });

  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'login-img.avif'),
    sourceId: 'coupleCouch',
    position: 'attention',
  });

  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'testimonial-img.png'),
    sourceId: 'coupleCouch',
    position: 'attention',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'blog-testi.png'),
    sourceId: 'manPortrait',
    position: 'attention',
  });

  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'user-img1.png'),
    sourceId: 'manPortrait',
    position: 'attention',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'user-img2.png'),
    sourceId: 'womanOffice',
    position: 'attention',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'team1.png'),
    sourceId: 'manPortrait',
    position: 'attention',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'team2.png'),
    sourceId: 'womanOffice',
    position: 'attention',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'team3.png'),
    sourceId: 'womanDesk',
    position: 'attention',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'comment1.png'),
    sourceId: 'manPortrait',
    position: 'attention',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'comment2.png'),
    sourceId: 'womanDesk',
    position: 'attention',
  });

  for (const name of ['property-details-1.png', 'property-details-1.webp']) {
    await writeCoverAsset({
      outputPath: assetPath('thumbs', name),
      sourceId: 'exteriorHero',
      position: 'entropy',
    });
  }
  for (const name of ['property-details-2.png', 'property-details-2.webp']) {
    await writeCoverAsset({
      outputPath: assetPath('thumbs', name),
      sourceId: 'exteriorBalconies',
      position: 'entropy',
    });
  }
  for (const name of ['property-details-3.png', 'property-details-3.webp']) {
    await writeCoverAsset({
      outputPath: assetPath('thumbs', name),
      sourceId: 'interiorLiving',
      position: 'centre',
    });
  }
  for (const name of ['property-details-4.png', 'property-details-4.webp']) {
    await writeCoverAsset({
      outputPath: assetPath('thumbs', name),
      sourceId: 'exteriorStreet',
      position: 'entropy',
    });
  }

  for (const [name, sourceId] of [
    ['property-1.png', 'exteriorHero'],
    ['property-2.png', 'exteriorBalconies'],
    ['property-3.png', 'interiorLiving'],
    ['property-4.png', 'exteriorStreet'],
  ]) {
    await writeCoverAsset({
      outputPath: assetPath('thumbs', name),
      sourceId,
      position: 'entropy',
    });
  }

  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'project-details.png'),
    sourceId: 'exteriorBalconies',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'project-details.webp'),
    sourceId: 'exteriorBalconies',
  });

  for (const [name, sourceId] of [
    ['project-img1.png', 'exteriorHero'],
    ['project-img2.png', 'interiorLiving'],
    ['project-img3.png', 'exteriorStreet'],
    ['project-img4.png', 'exteriorBalconies'],
  ]) {
    await writeCoverAsset({
      outputPath: assetPath('thumbs', name),
      sourceId,
      position: 'entropy',
    });
  }

  for (const [name, sourceId] of [
    ['gallery-img1.png', 'interiorLiving'],
    ['gallery-img1.webp', 'interiorLiving'],
    ['gallery-img2.png', 'exteriorHero'],
    ['gallery-img2.webp', 'exteriorHero'],
    ['gallery-img3.png', 'exteriorStreet'],
    ['gallery-img3.webp', 'exteriorStreet'],
    ['gallery-img4.png', 'exteriorBalconies'],
    ['gallery-img4.webp', 'exteriorBalconies'],
    ['gallery1.png', 'interiorLiving'],
    ['gallery2.png', 'exteriorHero'],
    ['gallery3.png', 'exteriorStreet'],
    ['gallery4.png', 'exteriorBalconies'],
    ['gallery5.png', 'coupleHome'],
    ['gallery6.png', 'officeTeam'],
  ]) {
    await writeCoverAsset({
      outputPath: assetPath('thumbs', name),
      sourceId,
      position: 'entropy',
    });
  }

  for (const [name, sourceId] of [
    ['portfolio1.png', 'exteriorHero'],
    ['portfolio1.webp', 'exteriorHero'],
    ['portfolio2.png', 'exteriorStreet'],
    ['portfolio2.webp', 'exteriorStreet'],
    ['portfolio3.png', 'interiorLiving'],
    ['portfolio3.webp', 'interiorLiving'],
    ['portfolio4.png', 'coupleHome'],
    ['portfolio4.webp', 'coupleHome'],
  ]) {
    await writeCoverAsset({
      outputPath: assetPath('thumbs', name),
      sourceId,
      position: 'entropy',
    });
  }

  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'message-img.png'),
    sourceId: 'officeTeam',
    position: 'attention',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'message-img.webp'),
    sourceId: 'officeTeam',
    position: 'attention',
  });

  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'newsletter-bg.png'),
    sourceId: 'interiorLiving',
    position: 'centre',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'newsletter-bg.webp'),
    sourceId: 'interiorLiving',
    position: 'centre',
  });

  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'blog1.png'),
    sourceId: 'exteriorStreet',
    position: 'entropy',
  });
  await writeCoverAsset({
    outputPath: assetPath('thumbs', 'blog1.webp'),
    sourceId: 'exteriorStreet',
    position: 'entropy',
  });

  await writeCoverAsset({
    outputPath: assetPath('blog', 'gurugram-guide.jpg'),
    sourceId: 'exteriorHero',
    position: 'entropy',
    size: { width: 1600, height: 900 },
  });

  await writeSourceCredits();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
