#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { mergeEntityRecords } from "./lib/entityNormalization.mjs";

const cwd = process.cwd();
const reportsDir = path.join(cwd, "scripts", "reports");
const rawFile = path.join(reportsDir, "entity-raw.json");
const mergedFile = path.join(reportsDir, "entity-coverage.json");
const dupesFile = path.join(reportsDir, "entity-duplicates.json");
const unresolvedFile = path.join(reportsDir, "entity-unresolved.json");
const isPlaceholderName = (name) => /^povp\s+[0-9a-z]+$/i.test(String(name || "").trim());

function main() {
  if (!fs.existsSync(rawFile)) {
    throw new Error(`Missing raw entity file: ${rawFile}`);
  }

  const raw = JSON.parse(fs.readFileSync(rawFile, "utf8"));
  const merged = mergeEntityRecords(raw);

  const slugCounts = new Map();
  for (const row of merged) {
    const key = row.slug;
    slugCounts.set(key, (slugCounts.get(key) || 0) + 1);
  }

  const duplicates = merged.filter((r) => (slugCounts.get(r.slug) || 0) > 1);
  const unresolved = raw.filter((r) => {
    const name = String(r?.name || "").trim();
    return !name || name.length < 3 || isPlaceholderName(name);
  });

  fs.writeFileSync(mergedFile, JSON.stringify(merged, null, 2));
  fs.writeFileSync(dupesFile, JSON.stringify(duplicates, null, 2));
  fs.writeFileSync(unresolvedFile, JSON.stringify(unresolved, null, 2));

  console.log(`Merged entities: ${merged.length}`);
  console.log(`Potential duplicates: ${duplicates.length}`);
  console.log(`Unresolved raw rows: ${unresolved.length}`);
}

main();
