/**
 * Turns a CMS page (GET /pages/{name}/public) into safe HTML plus a table of
 * contents. `format` decides the renderer: html is sanitized, markdown (and
 * json, shown as text) goes through the escaping chat renderer. Headings get
 * ids; the first heading is dropped when it repeats the page title (the H1).
 */
import { renderMarkdown } from '@/features/chat/markdown';
import { esc, sanitize, slugger, stripTags } from '@/features/content/shared/cms';

type TocItem = { id: string; text: string };
export type Rendered = { html: string; toc: TocItem[] };

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
/** Heading text: escaped, with bold and code only (block rules would turn "1. Title" into a list). */
const inlineMd = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');

/** Plain e-mail addresses in text become mailto links (the chat renderer only links http and site paths). */
const linkEmails = (html: string) =>
  html.replace(/(^|[\s(>])([\w.+-]+@[\w-]+(?:\.[\w-]+)+)(?=[\s.,;:)<]|$)/g, '$1<a href="mailto:$2">$2</a>');

function renderMarkdownPage(md: string, title: string): Rendered {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const heads = lines.map((l) => l.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/));
  let firstHead = heads.findIndex(Boolean);
  if (firstHead !== -1 && !same(heads[firstHead]![2]!, title)) firstHead = -1;
  const levels = heads.filter((h, i) => h && i !== firstHead).map((h) => h![1]!.length);
  const top = levels.length ? Math.min(...levels) : 2;
  const slug = slugger();
  const toc: TocItem[] = [];
  const out: string[] = [];
  let body: string[] = [];
  const flush = () => {
    const chunk = body.join('\n').trim();
    if (chunk) out.push(linkEmails(renderMarkdown(chunk)));
    body = [];
  };
  lines.forEach((line, i) => {
    const h = heads[i];
    if (!h) {
      // "**Name:** x" lines are one field per line in the CMS text; keep each on its own line.
      const prev = body[body.length - 1];
      if (/^\*\*[^*]+:\*\*/.test(line) && prev?.trim() && !/^\s*([-*•]|\d+[.)])\s/.test(prev)) body.push('');
      return body.push(line);
    }
    flush();
    if (i === firstHead) return;
    const level = Math.min(4, h[1]!.length - top + 2);
    const inner = inlineMd(h[2]!);
    const text = stripTags(inner);
    const id = slug(text);
    if (level === 2) toc.push({ id, text });
    out.push(`<h${level} id="${id}">${inner}</h${level}>`);
  });
  flush();
  return { html: out.join('\n'), toc };
}

function renderHtmlPage(html: string, title: string): Rendered {
  const slug = slugger();
  const toc: TocItem[] = [];
  let dropped = false;
  const clean = sanitize(html).replace(/<(h[1-6])((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/g, (m, tag: string, attrs: string, inner: string) => {
    const text = stripTags(inner);
    if (!dropped && !toc.length && same(text, title)) {
      dropped = true;
      return '';
    }
    const existing = attrs.match(/\sid="([^"]*)"/)?.[1];
    const id = existing ?? slug(text);
    if (tag === 'h2') toc.push({ id, text });
    return existing ? m : `<${tag}${attrs} id="${esc(id)}">${inner}</${tag}>`;
  });
  return { html: clean, toc };
}

export function renderPolicy(page: { content: string; format: string; title: string }): Rendered {
  if (page.format === 'html') return renderHtmlPage(page.content, page.title);
  if (page.format === 'json') return { html: `<pre>${esc(page.content)}</pre>`, toc: [] };
  return renderMarkdownPage(page.content, page.title);
}
