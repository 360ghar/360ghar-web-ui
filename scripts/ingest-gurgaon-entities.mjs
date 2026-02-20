#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const cwd = process.cwd();
const reportsDir = path.join(cwd, "scripts", "reports");
const rawFile = path.join(reportsDir, "entity-raw.json");
const localitiesPath = path.join(cwd, "src", "data", "localities.json");

const SOURCE_URLS = [
  { source: "magicbricks", url: "https://www.magicbricks.com/residential_projects.xml.gz", type: "project" },
  { source: "squareyards", url: "https://www.squareyards.com/sitemap-projects-location.xml", type: "project" },
  { source: "squareyards", url: "https://www.squareyards.com/sitemap-projects-sublocation.xml", type: "locality" },
  { source: "nobroker", url: "https://www.nobroker.in/sitemap/sale_gurgaon_nb_building_new.xml.gz", type: "society" },
  { source: "nobroker", url: "https://www.nobroker.in/sitemap/new-projects-gurgaon.xml.gz", type: "project" },
  { source: "commonfloor", url: "https://www.commonfloor.com/sitemap/Gurgaon_project_sitemap_1.xml", type: "project" },
];

const extractLoc = (xmlText) => {
  const out = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xmlText))) out.push(m[1]);
  return out;
};

export const isPlaceholderName = (name) => /^povp\s+[0-9a-z]+$/i.test(String(name || "").trim());

const cleanupSlugToken = (token) => token
    .replace(/\.(html|php|aspx?)$/g, "")
    .replace(/-npxid-r\d+$/g, "")
    .replace(/-gurgaon$|-gurugram$/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const decodeNameFromUrl = (url, source = {}) => {
  const decoded = decodeURIComponent(url).toLowerCase();
  const chunks = decoded.split("/").filter(Boolean);
  const last = chunks[chunks.length - 1] || "";

  if (source.source === "commonfloor" && /^povp-[0-9a-z]+$/i.test(last)) {
    const prev = chunks[chunks.length - 2] || "";
    return cleanupSlugToken(prev);
  }

  return cleanupSlugToken(last);
};

async function fetchSource(source) {
  try {
    const response = await fetch(source.url, { headers: { "user-agent": "360ghar-entity-ingestor/1.0" } });
    if (!response.ok) return [];
    const text = await response.text();
    return extractLoc(text)
      .filter((loc) => /gurgaon|gurugram/i.test(loc))
      .map((loc) => ({
        name: decodeNameFromUrl(loc, source),
        city: "Gurgaon",
        entityType: source.type,
        sourceCoverage: [source.source],
        sourceUrls: [loc],
        confidence: 0.7,
      }))
      .filter((r) => r.name.length > 2 && !isPlaceholderName(r.name));
  } catch (err) {
    console.error(`Failed to fetch ${source.source} from ${source.url}: ${err.message}`);
    return [];
  }
}

function fromExistingJson() {
  if (!fs.existsSync(localitiesPath)) return [];
  const items = JSON.parse(fs.readFileSync(localitiesPath, "utf8"));
  return items
    .filter((item) => !isPlaceholderName(item?.name))
    .map((item) => ({
      name: item.name,
      city: item.city || "Gurgaon",
      entityType: String(item.entityType || item.type || "locality").toLowerCase(),
      aliases: item.aliases || [],
      parentLocality: item.parentLocality || "",
      sourceCoverage: ["legacy-localities-json"],
      sourceUrls: [],
      confidence: 0.6,
      lastVerifiedAt: new Date().toISOString().slice(0, 10),
    }));
}

async function main() {
  fs.mkdirSync(reportsDir, { recursive: true });
  const raw = [...fromExistingJson()];

  for (const source of SOURCE_URLS) {
    // sequential to keep rate predictable
    // eslint-disable-next-line no-await-in-loop
    const rows = await fetchSource(source);
    raw.push(...rows);
  }

  fs.writeFileSync(rawFile, JSON.stringify(raw, null, 2));
  console.log(`Wrote raw entities: ${raw.length} -> ${rawFile}`);
}

const entryFile = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryFile) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
