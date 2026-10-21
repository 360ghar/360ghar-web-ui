/**
 * Cleans blog HTML on the server before it is rendered with set:html.
 * - Only content elements stay; scripts, frames, forms and styles are dropped.
 * - Only a few attributes stay; links and images must use safe URLs.
 * - h1 becomes h2 (the page has its own h1); h2 gets an id for the contents list.
 * Content that is not HTML (Markdown or plain text) goes through the chat renderer.
 *
 * The ultrahtml pass shapes the HTML (headings, contents list, links, images).
 * It is not a security boundary: its renderer does not escape quotes in
 * attributes, and its parser reads "<!-->" differently from browsers. The last
 * step, sanitize-html (htmlparser2), is the boundary: it re-serialises the HTML
 * from its own parse and keeps only the tags and attributes it lists
 * (`sanitize` in content/shared/cms).
 */
import { ELEMENT_NODE, TEXT_NODE, parse, renderSync, walkSync, type ElementNode, type Node as HtmlNode } from 'ultrahtml';
import sanitize from 'ultrahtml/transformers/sanitize';
import { renderMarkdown } from '@/features/chat/markdown';
import { decode, sanitize as gate, slugger } from '@/features/content/shared/cms';

const KEEP = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'sup', 'sub', 'mark', 'small'];
const DROP = ['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'noscript', 'template', 'svg', 'math', 'link', 'meta', 'base', 'head', 'title'];
const ATTRS: Record<string, string[]> = { a: ['href', 'title'], img: ['src', 'alt', 'title', 'width', 'height'], th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan'], ol: ['start'] };
const SAFE_HREF = /^(https?:|mailto:|tel:|\/(?!\/)|#)/i;

const textOf = (n: HtmlNode): string => (n.type === TEXT_NODE ? n.value : 'children' in n ? n.children.map(textOf).join('') : '');
const isHtml = (s: string) => new RegExp(`<(${[...KEEP, 'div'].join('|')})[\\s>/]`, 'i').test(s);

type Prepared = { html: string; toc: { id: string; text: string }[]; words: number };

/** `title`: a first heading with the same text as the page title is dropped (seed posts repeat it). */
export function prepareContent(raw: string | null | undefined, title?: string): Prepared {
  const source = (raw ?? '').trim();
  if (!source) return { html: '', toc: [], words: 0 };
  const doc = sanitize({ unblockElements: KEEP, dropElements: DROP })(parse(isHtml(source) ? source : renderMarkdown(source, true)));
  const norm = (x: string) => x.trim().toLowerCase().replace(/\s+/g, ' ');
  const first = (doc.children as HtmlNode[]).find((n) => n.type === ELEMENT_NODE || (n.type === TEXT_NODE && n.value.trim()));
  if (title && first?.type === ELEMENT_NODE && /^h[12]$/.test(first.name) && norm(decode(textOf(first))) === norm(title)) {
    doc.children = (doc.children as HtmlNode[]).filter((n) => n !== first);
  }
  const toc: Prepared['toc'] = [];
  const slug = slugger();
  let words = 0;
  walkSync(doc, (node) => {
    if (node.type === TEXT_NODE) {
      words += decode(node.value).split(/\s+/).filter(Boolean).length;
      return;
    }
    if (node.type !== ELEMENT_NODE) return;
    const el: ElementNode = node;
    const allowed = ATTRS[el.name] ?? [];
    for (const k of Object.keys(el.attributes)) if (!allowed.includes(k)) delete el.attributes[k];
    if (el.name === 'h1') el.name = 'h2';
    if (el.name === 'h2') {
      const text = decode(textOf(el)).trim();
      const id = slug(text);
      el.attributes.id = id;
      if (text) toc.push({ id, text });
    }
    if (el.name === 'a') {
      const href = (el.attributes.href ?? '').trim();
      if (!SAFE_HREF.test(href)) delete el.attributes.href;
      else if (/^https?:/i.test(href) && !/^https:\/\/(www\.)?360ghar\.com(\/|$)/i.test(href)) {
        el.attributes.rel = 'noopener noreferrer';
        el.attributes.target = '_blank';
      }
    }
    if (el.name === 'img') {
      el.attributes.alt ??= '';
      el.attributes.loading = 'lazy';
      el.attributes.decoding = 'async';
    }
  });
  return { html: gate(renderSync(doc)), toc, words };
}

/** Minutes to read at 200 words a minute; never below 1. */
export const readingMinutes = (words: number) => Math.max(1, Math.round(words / 200));
