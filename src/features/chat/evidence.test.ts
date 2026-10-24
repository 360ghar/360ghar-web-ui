import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const en = JSON.parse(readFileSync('src/i18n/locales/en/common.json', 'utf8')).chatbot;
const hi = JSON.parse(readFileSync('src/i18n/locales/hi/common.json', 'utf8')).chatbot;

describe('chat copy evidence limits', () => {
  it('does not promise verified results or unsupported account actions', () => {
    expect(en.welcomeSubtitle).toMatch(/confirm important details/i);
    expect(hi.welcomeSubtitle).toMatch(/पुष्टि/);
    expect(`${en.welcomeSubtitle} ${en.guestSubtitle}`).not.toMatch(/verified|expert|schedule|rent status|instantly/i);
    expect(`${hi.welcomeSubtitle} ${hi.guestSubtitle}`).not.toMatch(/वेरिफ़ाइड|विशेषज्ञ|शेड्यूल|किराया स्टेटस|तुरंत/i);
  });

  it('does not promise free or unregistered features', () => {
    expect(en.guestBannerText).toMatch(/Try the chat without signing in/i);
    expect(en.guestBannerText).toMatch(/conversation history/i);
    expect(en.guestBannerText).not.toMatch(/free|book visits|track rent/i);
    expect(hi.guestBannerText).toMatch(/बिना साइन इन/);
    expect(hi.guestBannerText).toMatch(/बातचीत का इतिहास/);
    expect(hi.guestBannerText).not.toMatch(/मुफ़्त|विज़िट|किराया/i);
  });
});
