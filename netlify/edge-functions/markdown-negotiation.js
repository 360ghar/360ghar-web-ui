// Netlify Edge Function: Markdown Content Negotiation
// When a request includes Accept: text/markdown, returns a markdown version
// of the HTML response. HTML remains the default for browsers.
// See: https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/

const HTML_TO_MD_RULES = [
  // Headings
  { pattern: /<h1[^>]*>(.*?)<\/h1>/gi, replacement: '# $1\n\n' },
  { pattern: /<h2[^>]*>(.*?)<\/h2>/gi, replacement: '## $1\n\n' },
  { pattern: /<h3[^>]*>(.*?)<\/h3>/gi, replacement: '### $1\n\n' },
  { pattern: /<h4[^>]*>(.*?)<\/h4>/gi, replacement: '#### $1\n\n' },
  { pattern: /<h5[^>]*>(.*?)<\/h5>/gi, replacement: '##### $1\n\n' },
  { pattern: /<h6[^>]*>(.*?)<\/h6>/gi, replacement: '###### $1\n\n' },
  // Paragraphs
  { pattern: /<p[^>]*>(.*?)<\/p>/gi, replacement: '$1\n\n' },
  // Bold / italic
  { pattern: /<strong[^>]*>(.*?)<\/strong>/gi, replacement: '**$1**' },
  { pattern: /<b[^>]*>(.*?)<\/b>/gi, replacement: '**$1**' },
  { pattern: /<em[^>]*>(.*?)<\/em>/gi, replacement: '*$1*' },
  { pattern: /<i[^>]*>(.*?)<\/i>/gi, replacement: '*$1*' },
  // Links
  { pattern: /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, replacement: '[$2]($1)' },
  // Images
  { pattern: /<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, replacement: '![$1]($2)' },
  { pattern: /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, replacement: '![$2]($1)' },
  // Lists
  { pattern: /<li[^>]*>(.*?)<\/li>/gi, replacement: '- $1\n' },
  // Line breaks
  { pattern: /<br\s*\/?>/gi, replacement: '\n' },
  // Horizontal rules
  { pattern: /<hr\s*\/?>/gi, replacement: '\n---\n\n' },
  // Code blocks
  { pattern: /<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, replacement: '```\n$1\n```\n\n' },
  { pattern: /<code[^>]*>(.*?)<\/code>/gi, replacement: '`$1`' },
  // Blockquotes
  { pattern: /<blockquote[^>]*>(.*?)<\/blockquote>/gis, replacement: (match, content) => {
    return content.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
  }},
  // Table rows
  { pattern: /<th[^>]*>(.*?)<\/th>/gi, replacement: '| $1 ' },
  { pattern: /<td[^>]*>(.*?)<\/td>/gi, replacement: '| $1 ' },
  { pattern: /<\/tr>/gi, replacement: '|\n' },
  // Remove remaining tags
  { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, replacement: '' },
  { pattern: /<style[^>]*>[\s\S]*?<\/style>/gi, replacement: '' },
  { pattern: /<head[^>]*>[\s\S]*?<\/head>/gi, replacement: '' },
  { pattern: /<nav[^>]*>[\s\S]*?<\/nav>/gi, replacement: '' },
  { pattern: /<footer[^>]*>[\s\S]*?<\/footer>/gi, replacement: '' },
  { pattern: /<[^>]+>/g, replacement: '' },
  // Decode HTML entities
  { pattern: /&amp;/g, replacement: '&' },
  { pattern: /&lt;/g, replacement: '<' },
  { pattern: /&gt;/g, replacement: '>' },
  { pattern: /&quot;/g, replacement: '"' },
  { pattern: /&#39;/g, replacement: "'" },
  { pattern: /&nbsp;/g, replacement: ' ' },
  // Clean up whitespace
  { pattern: /\n{3,}/g, replacement: '\n\n' },
];

function htmlToMarkdown(html) {
  let md = html;
  for (const rule of HTML_TO_MD_RULES) {
    md = md.replace(rule.pattern, rule.replacement);
  }
  return md.trim() + '\n';
}

function wantsMarkdown(request) {
  const accept = request.headers.get('accept') || '';
  // Check if text/markdown is preferred over text/html
  const parts = accept.split(',').map(part => {
    const [type, ...params] = part.trim().split(';');
    const q = params.find(p => p.trim().startsWith('q='));
    const quality = q ? parseFloat(q.trim().slice(2)) : 1;
    return { type: type.trim(), quality };
  });

  const mdPart = parts.find(p => p.type === 'text/markdown');
  const htmlPart = parts.find(p => p.type === 'text/html');

  if (!mdPart) return false;
  if (!htmlPart) return true;
  return mdPart.quality >= htmlPart.quality;
}

export default async (request, context) => {
  // Only transform if the client explicitly requests markdown
  if (!wantsMarkdown(request)) {
    return context.next();
  }

  // Get the original HTML response
  const response = await context.next();

  // Skip non-HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const html = await response.text();
  const markdown = htmlToMarkdown(html);

  // Estimate token count (rough: 1 token ≈ 4 chars)
  const tokenEstimate = Math.ceil(markdown.length / 4);

  return new Response(markdown, {
    status: response.status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Markdown-Tokens': String(tokenEstimate),
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Vary': 'Accept',
    },
  });
};

export const config = {
  path: '/*',
  excludedPath: [
    '/assets/*',
    '/.well-known/*',
    '/data/*',
    '/blueprint3d/*',
    '/rss/*',
  ],
};
