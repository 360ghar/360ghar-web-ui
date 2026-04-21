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

  writeFile(path.join(wellKnownDir, 'ai.txt'), artifacts.aiTxt);
  writeFile(path.join(wellKnownDir, 'api-catalog'), `${JSON.stringify(artifacts.apiCatalog, null, 2)}\n`);
  writeFile(path.join(publicDir, 'llms.txt'), artifacts.llmsTxt);
  writeFile(path.join(publicDir, 'llms-full.txt'), artifacts.llmsFullTxt);
  writeFile(path.join(dataDir, 'llm-feed.json'), `${JSON.stringify(artifacts.llmFeed, null, 2)}\n`);
}

main();
