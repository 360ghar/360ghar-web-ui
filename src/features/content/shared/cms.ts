/**
 * Helpers for pages that come from the CMS (policies, blog): the HTML sanitizer,
 * heading ids and the text helpers that build the contents list.
 */
import sanitizeHtml from 'sanitize-html';

export { esc } from './esc';

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
/** Reverses `esc` (and a few common entities) in one pass, so "&amp;lt;" becomes "&lt;", not "<". */
export const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name]!);

/** Text of an HTML string: tags removed, entities decoded. */
export const stripTags = (html: string) => decode(html.replace(/<[^>]*>/g, '')).trim();

/** Returns a function that turns heading text into an id; a repeated heading gets "-2", "-3" and so on. */
export function slugger() {
  const seen = new Set<string>();
  return (text: string) => {
    const base = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section';
    let id = base;
    for (let i = 2; seen.has(id); i += 1) id = `${base}-${i}`;
    seen.add(id);
    return id;
  };
}

const TAGS = 'a abbr address article aside b blockquote br caption cite code col colgroup dd del details dfn div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i img ins kbd li mark ol p pre q s section small span strong sub summary sup table tbody td tfoot th thead time tr u ul'.split(' ');

const GATE: sanitizeHtml.IOptions = {
  allowedTags: TAGS,
  allowedAttributes: {
    '*': ['id', 'class', 'title', 'lang', 'dir'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
    td: ['colspan', 'rowspan', 'scope'],
    th: ['colspan', 'rowspan', 'scope'],
    col: ['span'],
    colgroup: ['span'],
    ol: ['start', 'type', 'reversed'],
    time: ['datetime'],
    blockquote: ['cite'],
    q: ['cite'],
    details: ['open'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  // Active elements go with their content; other unknown tags keep their text.
  nonTextTags: ['script', 'style', 'textarea', 'option', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'math', 'select', 'button', 'title'],
  transformTags: {
    a: (tag, attribs) => {
      if (attribs.target === '_blank') attribs.rel = 'noopener noreferrer';
      else delete attribs.target;
      return { tagName: tag, attribs };
    },
  },
  // An image whose src was not https (removed above) shows nothing: drop it.
  exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
};

/**
 * Allowlist sanitizer for CMS HTML. It re-serialises the HTML from its own parse
 * (htmlparser2) and keeps only the tags, attributes and URL schemes listed above:
 * no scripts, styles, frames, forms, on* handlers or javascript: URLs.
 */
export const sanitize = (html: string) => sanitizeHtml(html, GATE);
