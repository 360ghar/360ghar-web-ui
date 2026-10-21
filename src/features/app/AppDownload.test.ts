import { describe, expect, it } from 'vitest';
import { osOf } from './AppDownload';

const nav = (userAgent: string, platform = '', maxTouchPoints = 0) => ({ userAgent, platform, maxTouchPoints });

describe('osOf', () => {
  it('finds Android, iPhone, iPad (also as a touch Mac) and desktop', () => {
    expect(osOf(nav('Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile'))).toBe('android');
    expect(osOf(nav('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'))).toBe('ios');
    expect(osOf(nav('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)'))).toBe('ios');
    expect(osOf(nav('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 5))).toBe('ios');
    expect(osOf(nav('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 0))).toBe('other');
    expect(osOf(nav('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32'))).toBe('other');
  });
});
