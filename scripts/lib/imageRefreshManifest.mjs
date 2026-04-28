import { promises as fs } from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

const SOURCE_FILE_PATTERN = /\.(js|jsx|ts|tsx|mjs)$/i;

const EXCLUDED_PHOTO_LIKE_NAMES = new Set([
  'breadcrumb-img.png',
  'counter-bg.png',
  'dotted-bg.png',
  'floor-plan.png',
  'house.png',
  'paypal.png',
  'visa.png',
]);

const P0_PATTERNS = [
  /^\/assets\/images\/thumbs\/banner-three\.png$/,
  /^\/assets\/images\/thumbs\/about-three-img\.png$/,
  /^\/assets\/images\/thumbs\/cta-img\.png$/,
  /^\/assets\/images\/thumbs\/login-img\.avif$/,
  /^\/assets\/images\/thumbs\/team\d+\.png$/,
  /^\/assets\/images\/thumbs\/user-img\d+\.png$/,
  /^\/assets\/images\/thumbs\/property-details-\d+\.(png|webp)$/,
  /^\/assets\/images\/thumbs\/project-details\.(png|webp)$/,
  /^\/assets\/images\/thumbs\/banner-img\.(png|webp)$/,
  /^\/assets\/images\/thumbs\/property-\d+\.png$/,
  /^\/assets\/images\/blog\/gurugram-guide\.jpg$/,
];

const P1_PATTERNS = [
  /^\/assets\/images\/thumbs\/about-img\.png$/,
  /^\/assets\/images\/thumbs\/about-two-img\.png$/,
  /^\/assets\/images\/thumbs\/blog-testi\.png$/,
  /^\/assets\/images\/thumbs\/blog\d+\.png$/,
  /^\/assets\/images\/thumbs\/comment\d+\.png$/,
  /^\/assets\/images\/thumbs\/gallery(-img)?\d+\.png$/,
  /^\/assets\/images\/thumbs\/message-img\.png$/,
  /^\/assets\/images\/thumbs\/newsletter-bg\.png$/,
  /^\/assets\/images\/thumbs\/portfolio\d+\.png$/,
  /^\/assets\/images\/thumbs\/project-img\d+\.png$/,
  /^\/assets\/images\/thumbs\/testimonial-img\.png$/,
];

const TRANSPARENT_REQUIRED = new Set([
  '/assets/images/thumbs/about-three-img.png',
  '/assets/images/thumbs/banner-img.png',
  '/assets/images/thumbs/banner-three.png',
  '/assets/images/thumbs/cta-img.png',
]);

function gcd(a, b) {
  if (!a || !b) return 1;
  return b === 0 ? a : gcd(b, a % b);
}

function toAspectRatio(width, height) {
  if (!width || !height) return null;
  const divisor = gcd(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

async function walkFiles(dir) {
  const output = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...await walkFiles(fullPath));
      continue;
    }

    if (SOURCE_FILE_PATTERN.test(entry.name)) {
      output.push(fullPath);
    }
  }

  return output;
}

function normalizeAssetPath(assetPath) {
  if (!assetPath) return null;

  if (assetPath.startsWith('https://360ghar.com/assets/images/')) {
    return assetPath.replace('https://360ghar.com', '');
  }

  if (assetPath.startsWith('/assets/images/')) {
    return assetPath;
  }

  if (assetPath.startsWith('assets/images/')) {
    return `/${assetPath}`;
  }

  return null;
}

function extractAssetUrlsFromLiteral(literal) {
  if (typeof literal !== 'string' || literal.length === 0) return [];

  const candidates = literal
    .split(',')
    .flatMap((segment) => segment.match(/(?:https:\/\/360ghar\.com)?\/?assets\/images\/[^\s'"`]+/g) || []);

  return [...new Set(candidates
    .map((assetPath) => normalizeAssetPath(assetPath))
    .filter(Boolean))];
}

async function collectReferencedImages({ repoRoot }) {
  const srcDir = path.join(repoRoot, 'src');
  const files = await walkFiles(srcDir);
  const references = new Map();
  const literalPattern = /['"`]([^'"`]*assets\/images\/[^'"`]+)['"`]/g;

  for (const filePath of files) {
    const text = await fs.readFile(filePath, 'utf8');
    let match;

    while ((match = literalPattern.exec(text)) !== null) {
      const assets = extractAssetUrlsFromLiteral(match[1]);
      for (const assetPath of assets) {
        if (!references.has(assetPath)) {
          references.set(assetPath, new Set());
        }
        references.get(assetPath).add(path.relative(repoRoot, filePath));
      }
    }
  }

  return [...references.entries()]
    .map(([assetPath, usage]) => ({
      path: assetPath,
      usage: [...usage].sort(),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function isPhotoLikeAsset(assetPath) {
  if (!assetPath.startsWith('/assets/images/thumbs/') && assetPath !== '/assets/images/blog/gurugram-guide.jpg') {
    return false;
  }

  if (assetPath.startsWith('/assets/images/thumbs/')) {
    const fileName = path.basename(assetPath);
    return !EXCLUDED_PHOTO_LIKE_NAMES.has(fileName);
  }

  return true;
}

function getPriorityTier(assetPath) {
  if (P0_PATTERNS.some((pattern) => pattern.test(assetPath))) return 'P0';
  if (P1_PATTERNS.some((pattern) => pattern.test(assetPath))) return 'P1';
  return 'P2';
}

function getReplacementBrief(assetPath) {
  if (/banner-three|banner-img/.test(assetPath)) {
    return 'Hero exterior for Gurugram/NCR: realistic Indian residential tower or builder-floor facade in daylight, premium but believable, cropped safely inside the existing hero composition.';
  }

  if (/about-three-img|about-img|about-two-img/.test(assetPath)) {
    return 'Trust-building lifestyle image: Indian buyers or advisors in a modern Indian home context, natural expressions, no western sale-sign tropes, warm daylight and credible wardrobe.';
  }

  if (/cta-img/.test(assetPath)) {
    return 'Owner onboarding support visual on transparent canvas: realistic Indian owner or advisor moment, shaped to preserve the floating CTA slot without introducing a hard-edged rectangle.';
  }

  if (/login-img/.test(assetPath)) {
    return 'Login/register support image: Indian home-search or onboarding moment in a clean modern interior, calm natural light, welcoming but not staged.';
  }

  if (/team\d+|user-img\d+|comment\d+|blog-testi|testimonial-img/.test(assetPath)) {
    return 'Portrait-led people image: Indian professionals, buyers, or residents with natural skin tones, business-casual styling, authentic expression, and tight safe-crop for avatar or testimonial framing.';
  }

  if (/property-details|property-\d+|project-details|project-img\d+/.test(assetPath)) {
    return 'Property fallback/gallery image: realistic Gurugram/NCR apartment exteriors or Indian interiors, no western suburb cues, balanced daylight, and enough negative space for overlay UI.';
  }

  if (/gallery|portfolio|message-img|newsletter-bg|blog\d+/.test(assetPath)) {
    return 'Support image for marketing content: India-first residential lifestyle or interior scene, realistic materials and lighting, aligned with the existing card or background crop.';
  }

  if (/gurugram-guide/.test(assetPath)) {
    return 'Editorial hero for the Gurugram guide: NCR residential skyline or apartment facade that signals the local market clearly without looking like generic international stock.';
  }

  return 'Replace with a realistic India-first residential or people image that preserves the current crop, lighting balance, and layout role.';
}

async function getImageMetadata(publicRoot, assetPath) {
  const localPath = path.join(publicRoot, assetPath.replace(/^\/assets\//, 'assets/'));
  try {
    const metadata = await sharp(localPath).metadata();
    return {
      exists: true,
      localPath,
      format: metadata.format || null,
      width: metadata.width || null,
      height: metadata.height || null,
      hasAlpha: Boolean(metadata.hasAlpha),
      aspectRatio: toAspectRatio(metadata.width, metadata.height),
    };
  } catch {
    return {
      exists: false,
      localPath,
      format: null,
      width: null,
      height: null,
      hasAlpha: false,
      aspectRatio: null,
    };
  }
}

export async function findMissingLocalImageReferences({ repoRoot }) {
  const references = await collectReferencedImages({ repoRoot });
  const publicRoot = path.join(repoRoot, 'public');
  const missing = [];

  for (const reference of references) {
    if (!reference.path.startsWith('/assets/images/')) continue;

    const localPath = path.join(publicRoot, reference.path.replace(/^\/assets\//, 'assets/'));

    try {
      await fs.access(localPath);
    } catch {
      missing.push({
        path: reference.path,
        usage: reference.usage,
      });
    }
  }

  return missing;
}

export async function buildImageRefreshManifest({ repoRoot }) {
  const references = await collectReferencedImages({ repoRoot });
  const publicRoot = path.join(repoRoot, 'public');
  const entries = [];

  for (const reference of references) {
    if (!isPhotoLikeAsset(reference.path)) continue;

    const metadata = await getImageMetadata(publicRoot, reference.path);

    entries.push({
      path: reference.path,
      usage: reference.usage,
      exists: metadata.exists,
      localPath: metadata.localPath,
      format: metadata.format,
      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
      aspectRatio: metadata.aspectRatio,
      transparentBackgroundRequired: TRANSPARENT_REQUIRED.has(reference.path),
      currentHasAlpha: metadata.hasAlpha,
      priorityTier: getPriorityTier(reference.path),
      replacementBrief: getReplacementBrief(reference.path),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    entryCount: entries.length,
    entries: entries.sort((a, b) => a.path.localeCompare(b.path)),
  };
}
