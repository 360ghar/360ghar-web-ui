import { describe, expect, it } from 'vitest';
import { homeFacts } from './facts';

describe('homepage fact sheet evidence limits', () => {
  it('does not publish unsupported counts or service claims in either locale', () => {
    const en = homeFacts('en');
    const hi = homeFacts('hi');
    const copy = [...en.rows, ...hi.rows].map((row) => row.value).join('\n');

    expect(copy).not.toMatch(/109 homes listed|2,043|3,215|verifies each one|every home|free tools|free calculators|upfront fee|relationship manager|circle rates|RERA projects|bank auctions|founded in 2025/i);
  });

  it('labels locality pages as selected and does not imply verified inventory', () => {
    const copy = homeFacts('en').rows.map((row) => row.value).join('\n');
    expect(copy).toMatch(/selected locality pages/i);
    expect(copy).toMatch(/not evidence of live inventory coverage/i);
    expect(copy).toMatch(/do not verify property information/i);
  });
});
