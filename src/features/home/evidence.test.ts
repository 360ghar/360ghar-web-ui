import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const faqCopy = (locale: 'en' | 'hi') => {
  const messages = JSON.parse(readFileSync(`src/i18n/locales/${locale}/home.json`, 'utf8')) as {
    faq: Record<string, string>;
    structuredFaq: Record<string, string>;
  };
  return [...Object.values(messages.faq), ...Object.values(messages.structuredFaq)].join('\n');
};

const visibleHomeCopy = (locale: 'en' | 'hi') => {
  const messages = JSON.parse(readFileSync(`src/i18n/locales/${locale}/site.json`, 'utf8')) as {
    footer: { tagline: string };
    home: {
      title: string;
      eyebrow: string;
      countLead: string;
      countFallback: string;
      howTitle: string;
      ownersBody: string;
      ownersCta: string;
      explore: { localities: string };
    };
  };
  const common = JSON.parse(readFileSync(`src/i18n/locales/${locale}/common.json`, 'utf8')) as {
    cta: { description: string };
    newsletter: { description: string };
  };
  const { footer, home } = messages;
  return [
    footer.tagline,
    home.title,
    home.eyebrow,
    home.countLead,
    home.countFallback,
    home.howTitle,
    home.ownersBody,
    home.ownersCta,
    home.explore.localities,
    common.cta.description,
    common.newsletter.description,
  ].join('\n');
};

const homeMetaCopy = (locale: 'en' | 'hi') => {
  const home = JSON.parse(readFileSync(`src/i18n/locales/${locale}/home.json`, 'utf8')) as {
    seo: { title: string; description: string };
    about: { title: string };
  };
  const seo = JSON.parse(readFileSync(`src/i18n/locales/${locale}/seo.json`, 'utf8')) as {
    home: { title: string; description: string };
    about: { title: string; description: string };
  };
  return [
    home.seo.title,
    home.seo.description,
    home.about.title,
    seo.home.title,
    seo.home.description,
    seo.about.title,
    seo.about.description,
  ].join('\n');
};

describe('home FAQ evidence', () => {
  it('avoids blanket verification, fraud, service and RERA claims in both locales', () => {
    const english = faqCopy('en');
    const hindi = faqCopy('hi');

    expect(english).not.toMatch(
      /India's first|every property listing|zero fake listings|dedicated Relationship Manager|we verify the RERA registration details for all/i,
    );
    expect(hindi).not.toMatch(
      /भारत का पहला|हर एक प्रॉपर्टी|शून्य फर्जी लिस्टिंग|हर खरीदार.*रिलेशनशिप मैनेजर|सभी नई.*वेरिफाई/i,
    );
    expect(english).toMatch(/availability and data coverage vary/i);
    expect(english).toMatch(/official RERA register/i);
    expect(hindi).toMatch(/लिस्टिंग उपलब्धता.*डेटा कवरेज अलग-अलग/i);
    expect(hindi).toMatch(/आधिकारिक RERA रजिस्टर/i);
  });
});

describe('visible home copy', () => {
  it('does not claim universal verification, tours, free service or unsupported locality coverage', () => {
    const english = visibleHomeCopy('en');
    const hindi = visibleHomeCopy('hi');

    expect(english).not.toMatch(/verified|checked by our team|walk through|walk in before|visit once|no fake listings|zero brokerage|2,000\+|free|360°/i);
    expect(hindi).not.toMatch(/वेरिफाइड|जांच|जाँच|विज़िट से पहले|फर्जी|फ़र्ज़ी|ब्रोकरेज|2,000\+|मुफ़्त|360°/i);
  });

  it('keeps English and Hindi home and about metadata within verified product facts', () => {
    const english = homeMetaCopy('en');
    const hindi = homeMetaCopy('hi');

    expect(english).not.toMatch(/India's first|VR-First|AI \+ VR|verified|360°|no fake|eliminates fake|physically verified/i);
    expect(hindi).not.toMatch(/भारत का पहला|VR-फर्स्ट|AI \+ VR|वेरिफाइड|360°|फर्जी|फ़र्ज़ी|शारीरिक रूप से वेरिफाइड/i);
  });
});
