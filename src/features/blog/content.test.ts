import { describe, expect, it } from 'vitest';
import { prepareContent, readingMinutes } from './content';

describe('prepareContent', () => {
  it('drops scripts, handlers and unsafe links', () => {
    const { html } = prepareContent('<p onclick="x()">Hi <a href="javascript:alert(1)">bad</a> <a href="//evil.com">proto</a></p><script>alert(1)</script><iframe src="x"></iframe>');
    expect(html).not.toMatch(/script|onclick|javascript|iframe|evil/);
    expect(html).toContain('<p>Hi <a>bad</a> <a>proto</a></p>');
  });

  it('blocks attribute quote injection and the "<!-->" comment trick', () => {
    const quote = prepareContent(`<p><a href='https://x" onmouseover="alert(8)'>x</a></p>`).html;
    expect(quote).not.toMatch(/<a[^>]*\sonmouseover=/i);
    const comment = prepareContent('<p>a</p><!--><img src=x onerror=alert(11)>-->').html;
    expect(comment).not.toMatch(/onerror/i);
    const svg = prepareContent('<p>a</p><svg><script>alert(1)</script></svg><math><mi xlink:href="javascript:alert(1)">x</mi></math>').html;
    expect(svg).not.toMatch(/script|javascript|<svg|<math/i);
    const img = prepareContent('<img src="https://ok.test/a.jpg" onerror="alert(1)" srcset="javascript:alert(1)">').html;
    expect(img).not.toMatch(/onerror|srcset|javascript/i);
  });

  it('keeps text inside unknown elements and strips styles', () => {
    expect(prepareContent('<div class="x" style="color:red"><span>Kept</span></div>').html).toBe('Kept');
  });

  it('demotes h1, gives h2 unique ids and builds the contents list', () => {
    const r = prepareContent('<h1>Intro</h1><p>a b c</p><h2>Rent &amp; deposit</h2><h2>Rent &amp; deposit</h2>');
    expect(r.html).toContain('<h2 id="intro">Intro</h2>');
    expect(r.toc).toEqual([
      { id: 'intro', text: 'Intro' },
      { id: 'rent-deposit', text: 'Rent & deposit' },
      { id: 'rent-deposit-2', text: 'Rent & deposit' },
    ]);
  });

  it('opens outside links in a new tab and lazy-loads images', () => {
    const { html } = prepareContent('<p><a href="https://rera.haryana.gov.in">RERA</a> <a href="/properties">homes</a></p><img src="http://x/y.jpg"><img src="https://res.cloudinary.com/a.jpg" alt="A">');
    expect(html).toContain('<a href="https://rera.haryana.gov.in" rel="noopener noreferrer" target="_blank">');
    expect(html).toContain('<a href="/properties">');
    expect(html).not.toContain('http://x/y.jpg');
    expect(html.match(/<img/g)).toHaveLength(1);
    expect(html).toMatch(/<img src="https:\/\/res.cloudinary.com\/a.jpg" alt="A" loading="lazy"/);
  });

  it('drops a first heading that repeats the title', () => {
    expect(prepareContent('<h2>Vastu tips</h2><p>Body</p>', 'Vastu Tips').html).toBe('<p>Body</p>');
    expect(prepareContent('<h2>Other</h2><p>Body</p>', 'Vastu Tips').html).toContain('<h2 id="other">');
  });

  it('renders Markdown and counts words', () => {
    const r = prepareContent('Line one here.\n\n- item one\n- item two');
    expect(r.html).toContain('<ul><li>item one</li>');
    expect(r.words).toBe(7);
    expect(readingMinutes(r.words)).toBe(1);
  });
});
