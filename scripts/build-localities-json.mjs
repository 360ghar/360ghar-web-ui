#!/usr/bin/env node
import fs from "fs";
import path from "path";

const cwd = process.cwd();
const mergedFile = path.join(cwd, "scripts", "reports", "entity-coverage.json");
const outFile = path.join(cwd, "src", "data", "localities.json");

function main() {
  if (!fs.existsSync(mergedFile)) {
    throw new Error(`Missing merged file: ${mergedFile}`);
  }
  const merged = JSON.parse(fs.readFileSync(mergedFile, "utf8"));

  const finalRows = merged.map((item, idx) => ({
    id: idx + 1,
    ...item,
  }));

  fs.writeFileSync(outFile, JSON.stringify(finalRows, null, 2));
  console.log(`Wrote ${finalRows.length} entities -> ${outFile}`);
}

main();
