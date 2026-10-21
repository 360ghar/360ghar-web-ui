/**
 * Small, safe Markdown renderer for chat replies. It escapes all HTML first,
 * then adds a few inline and block formats. Links must be http(s) or site paths.
 * Enough for model replies; not a general Markdown engine.
 */
import { esc } from '@/features/content/shared/esc';

function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/(?![/\\]))[^\s)]*)\)/g, (_, text: string, href: string) => {
      const external = href.startsWith('http') && !href.startsWith('https://360ghar.com');
      return `<a href="${href}"${external ? ' rel="noopener noreferrer" target="_blank"' : ''}>${text}</a>`;
    });
}

/** `headings`: emit real h1 to h4 elements (blog posts); chat replies keep a bold line. */
export function renderMarkdown(md: string, headings = false): string {
  const lines = esc(md.replace(/\r\n/g, '\n')).split('\n');
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    const ul = line.match(/^\s*[-*•]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (!line.trim()) {
      flushPara();
      closeList();
    } else if (h) {
      flushPara();
      closeList();
      out.push(headings ? `<h${h[1]!.length}>${inline(h[2]!)}</h${h[1]!.length}>` : `<p class="chat-h"><strong>${inline(h[2]!)}</strong></p>`);
    } else if (ul || ol) {
      flushPara();
      const kind = ul ? 'ul' : 'ol';
      if (list !== kind) {
        closeList();
        out.push(`<${kind}>`);
        list = kind;
      }
      out.push(`<li>${inline((ul ?? ol)![1]!)}</li>`);
    } else {
      closeList();
      para.push(line.trim());
    }
  }
  flushPara();
  closeList();
  return out.join('');
}
