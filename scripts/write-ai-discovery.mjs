#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { buildAiDiscoveryArtifacts } from '../src/seo/aiDiscovery.js';

const cwd = process.cwd();
const publicDir = path.join(cwd, 'public');
const wellKnownDir = path.join(publicDir, '.well-known');
const dataDir = path.join(publicDir, 'data');

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Wrote ${filePath}`);
}

function main() {
  const artifacts = buildAiDiscoveryArtifacts();
  const feed = artifacts.llmFeed;

  // Enrich with localities and societies from index
  const localitiesIndexPath = path.join(cwd, 'src', 'data', 'localities-index.json');
  if (fs.existsSync(localitiesIndexPath)) {
    const localitiesIndex = JSON.parse(fs.readFileSync(localitiesIndexPath, 'utf8'));

    const siteUrl = feed.homepage.replace(/\/$/, '');
    const topLocalities = localitiesIndex
      .slice(0, 50)
      .map((loc) => ({
        name: loc.name,
        slug: loc.slug,
        city: loc.city,
        entityType: loc.entityType,
        url: `${siteUrl}/locality/${loc.slug}`,
      }));

    const topSocieties = localitiesIndex
      .filter((loc) => loc.entityType === 'society')
      .slice(0, 20)
      .map((loc) => ({
        name: loc.name,
        slug: loc.slug,
        city: loc.city,
        url: `${siteUrl}/locality/${loc.slug}`,
      }));

    feed.top_localities = topLocalities;
    feed.top_societies = topSocieties;
    feed.metadata.total_localities = localitiesIndex.length;
    feed.metadata.total_societies = localitiesIndex.filter((l) => l.entityType === 'society').length;
  }

  writeFile(path.join(wellKnownDir, 'ai.txt'), artifacts.aiTxt);
  writeFile(path.join(wellKnownDir, 'api-catalog'), `${JSON.stringify(artifacts.apiCatalog, null, 2)}\n`);
  writeFile(path.join(publicDir, 'llms.txt'), artifacts.llmsTxt);
  writeFile(path.join(publicDir, 'llms-full.txt'), artifacts.llmsFullTxt);
  writeFile(path.join(dataDir, 'llm-feed.json'), `${JSON.stringify(feed, null, 2)}\n`);
}

main();
