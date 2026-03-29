#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const inputPath = path.join(cwd, 'src', 'data', 'localities.json');
const outputPath = path.join(cwd, 'src', 'data', 'localities-index.json');

function buildLocalitiesIndex(localities) {
  return localities
    .map((item) => ({
      slug: item.slug,
      name: item.name,
      city: item.city || 'Gurugram',
      entityType: item.entityType || item.type || 'Locality',
      type: item.type || item.entityType || 'Locality',
      lastVerifiedAt: item.lastVerifiedAt || null,
    }))
    .filter((item) => item.slug && item.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing localities source file: ${inputPath}`);
  }

  const localities = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const indexData = buildLocalitiesIndex(localities);

  fs.writeFileSync(outputPath, `${JSON.stringify(indexData, null, 2)}\n`, 'utf8');
  console.log(`Wrote localities index: ${outputPath}`);
}

main();
