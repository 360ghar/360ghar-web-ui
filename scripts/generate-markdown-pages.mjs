#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { JSDOM } from 'jsdom';

import { absoluteUrl } from '../src/seo/siteMetadata.js';
import { getMarkdownOutputPath as getSharedMarkdownOutputPath, markdownPublicRoutes } from '../src/seo/markdownRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');

const BLOCK_TAGS = new Set([
  'article',
  'aside',
  'blockquote',
  'div',
  'figure',
  'figcaption',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'tbody',
  'thead',
  'tr',
  'td',
  'th',
  'ul',
]);

export function getMarkdownBuildRoutes() {
  return markdownPublicRoutes;
}

export function getMarkdownOutputPath(route) {
  return getSharedMarkdownOutputPath(route);
}

function getHtmlInputPath(route) {
  if (route === '/') {
    return path.join(DIST_DIR, 'index.html');
  }

  return path.join(DIST_DIR, route.replace(/^\/+/, ''), 'index.html');
}

function yamlQuote(value) {
  return JSON.stringify(String(value ?? ''));
}

function collapseWhitespace(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeInlineMarkdown(text) {
  return text.replace(/([\\`*_{}[\]()#+\-!|>])/g, '\\$1');
}

function normalizeInlineOutput(value) {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function renderInline(node) {
  if (node.nodeType === node.TEXT_NODE) {
    return escapeInlineMarkdown(collapseWhitespace(node.textContent));
  }

  if (node.nodeType !== node.ELEMENT_NODE) {
    return '';
  }

  const tagName = node.tagName.toLowerCase();

  if (tagName === 'br') {
    return '\n';
  }

  if (tagName === 'code') {
    return `\`${collapseWhitespace(node.textContent)}\``;
  }

  if (tagName === 'strong' || tagName === 'b') {
    const content = normalizeInlineOutput(renderInlineChildren(node));
    return content ? `**${content}**` : '';
  }

  if (tagName === 'em' || tagName === 'i') {
    const content = normalizeInlineOutput(renderInlineChildren(node));
    return content ? `*${content}*` : '';
  }

  if (tagName === 'a') {
    const href = node.getAttribute('href') || '';
    const content = normalizeInlineOutput(renderInlineChildren(node)) || collapseWhitespace(node.textContent) || href;
    if (!href) {
      return content;
    }
    return `[${content}](${href})`;
  }

  if (tagName === 'img') {
    const src = node.getAttribute('src') || '';
    if (!src) {
      return '';
    }
    const alt = collapseWhitespace(node.getAttribute('alt') || '');
    return `![${alt}](${src})`;
  }

  return renderInlineChildren(node);
}

function renderInlineChildren(node) {
  const pieces = [];

  for (const child of node.childNodes) {
    const value = renderInline(child);
    if (value) {
      pieces.push(value);
    }
  }

  return pieces.join(' ').replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n');
}

function hasBlockChildren(node) {
  return Array.from(node.children).some((child) => BLOCK_TAGS.has(child.tagName.toLowerCase()));
}

function renderListItem(node, depth, ordered, index) {
  const indent = '  '.repeat(depth);
  const marker = ordered ? `${index + 1}.` : '-';
  const inlineParts = [];
  const nestedParts = [];

  for (const child of node.childNodes) {
    if (child.nodeType === child.ELEMENT_NODE) {
      const tagName = child.tagName.toLowerCase();
      if (tagName === 'ul' || tagName === 'ol') {
        const nested = renderBlock(child, depth + 1).trim();
        if (nested) {
          nestedParts.push(nested);
        }
        continue;
      }
    }

    const value = renderInline(child);
    if (value) {
      inlineParts.push(value);
    }
  }

  const line = `${indent}${marker} ${normalizeInlineOutput(inlineParts.join(' '))}`.trimEnd();
  return [line, ...nestedParts].filter(Boolean).join('\n');
}

function renderTable(node) {
  const rows = Array.from(node.querySelectorAll('tr')).map((row) =>
    Array.from(row.children).map((cell) => normalizeInlineOutput(renderInlineChildren(cell)))
  );

  if (rows.length === 0) {
    return '';
  }

  const [header, ...body] = rows;
  const headerLine = `| ${header.join(' | ')} |`;
  const separatorLine = `| ${header.map(() => '---').join(' | ')} |`;
  const bodyLines = body.map((cells) => `| ${cells.join(' | ')} |`);

  return [headerLine, separatorLine, ...bodyLines].join('\n');
}

function renderBlock(node, depth = 0) {
  if (node.nodeType === node.TEXT_NODE) {
    const text = collapseWhitespace(node.textContent);
    return text ? `${escapeInlineMarkdown(text)}\n\n` : '';
  }

  if (node.nodeType !== node.ELEMENT_NODE) {
    return '';
  }

  const tagName = node.tagName.toLowerCase();

  if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
    return '';
  }

  if (/^h[1-6]$/.test(tagName)) {
    const level = Number(tagName.slice(1));
    const content = normalizeInlineOutput(renderInlineChildren(node));
    return content ? `${'#'.repeat(level)} ${content}\n\n` : '';
  }

  if (tagName === 'p' || tagName === 'figcaption') {
    const content = normalizeInlineOutput(renderInlineChildren(node));
    return content ? `${content}\n\n` : '';
  }

  if (tagName === 'ul' || tagName === 'ol') {
    const ordered = tagName === 'ol';
    const items = Array.from(node.children)
      .filter((child) => child.tagName.toLowerCase() === 'li')
      .map((child, index) => renderListItem(child, depth, ordered, index))
      .filter(Boolean);
    return items.length > 0 ? `${items.join('\n')}\n\n` : '';
  }

  if (tagName === 'pre') {
    const content = node.textContent?.replace(/\s+$/, '') ?? '';
    return content ? `\`\`\`\n${content}\n\`\`\`\n\n` : '';
  }

  if (tagName === 'blockquote') {
    const content = renderChildren(node, depth).trim();
    if (!content) {
      return '';
    }

    const quoted = content
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n');
    return `${quoted}\n\n`;
  }

  if (tagName === 'hr') {
    return '---\n\n';
  }

  if (tagName === 'table') {
    const table = renderTable(node);
    return table ? `${table}\n\n` : '';
  }

  if (hasBlockChildren(node)) {
    return renderChildren(node, depth);
  }

  const inlineContent = normalizeInlineOutput(renderInlineChildren(node));
  return inlineContent ? `${inlineContent}\n\n` : '';
}

function renderChildren(node, depth = 0) {
  const chunks = [];

  for (const child of node.childNodes) {
    const value = renderBlock(child, depth);
    if (value) {
      chunks.push(value);
    }
  }

  return chunks.join('');
}

function normalizeMarkdownOutput(markdown) {
  return markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function ensureTitleHeading(markdownBody, title) {
  if (!markdownBody) {
    return title ? `# ${title}` : '';
  }

  if (/^#{1,6}\s/m.test(markdownBody)) {
    return markdownBody;
  }

  return title ? `# ${title}\n\n${markdownBody}` : markdownBody;
}

export function buildMarkdownDocument({ route, html }) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const title = collapseWhitespace(document.title) || absoluteUrl(route);
  const description = collapseWhitespace(
    document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
  );
  const canonicalHref =
    document.querySelector('link[rel="canonical"]')?.getAttribute('href') || absoluteUrl(route);
  const canonical = absoluteUrl(canonicalHref);
  const main = document.querySelector('main');

  if (!main) {
    throw new Error(`Missing <main> in prerendered HTML for route ${route}`);
  }

  const markdownBody = ensureTitleHeading(normalizeMarkdownOutput(renderChildren(main)), title);

  return [
    '---',
    `route: ${yamlQuote(route)}`,
    `source: ${yamlQuote(canonical)}`,
    `canonical: ${yamlQuote(canonical)}`,
    `title: ${yamlQuote(title)}`,
    `description: ${yamlQuote(description)}`,
    '---',
    '',
    markdownBody,
    '',
  ].join('\n');
}

async function writeMarkdownAsset(route) {
  const inputPath = getHtmlInputPath(route);
  if (!existsSync(inputPath)) {
    throw new Error(`Missing prerendered HTML for route ${route}: ${inputPath}`);
  }

  const html = await readFile(inputPath, 'utf8');
  const markdown = buildMarkdownDocument({ route, html });
  const outputPath = path.join(DIST_DIR, getMarkdownOutputPath(route));

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown, 'utf8');

  return outputPath;
}

async function main() {
  for (const route of getMarkdownBuildRoutes()) {
    const outputPath = await writeMarkdownAsset(route);
    console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
  }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
