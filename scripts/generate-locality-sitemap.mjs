#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { buildLocalitySitemapXml } from "./lib/localitySitemap.mjs";

const siteUrl = process.env.SITE_URL || "https://360ghar.com";
const cwd = process.cwd();
const dataFile = path.join(cwd, "src", "data", "localities.json");
const outFile = path.join(cwd, "public", "sitemap-localities.xml");

function main() {
  if (!fs.existsSync(dataFile)) {
    throw new Error(`Missing localities file: ${dataFile}`);
  }
  const entities = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  const xml = buildLocalitySitemapXml(siteUrl, entities);
  fs.writeFileSync(outFile, xml);
  console.log(`Wrote locality sitemap: ${outFile}`);
}

main();
