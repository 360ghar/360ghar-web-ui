/**
 * Rules-based link check for property listings. No AI and no network call:
 * it reads the pasted URL, finds the portal from the hostname (the old site's
 * list of 5 portals) and flags link patterns that often hide a fake page.
 */

export type PortalKey = '99acres' | 'magicbricks' | 'housing' | 'nobroker' | 'commonfloor';

export const PORTALS: { key: PortalKey; name: string; domain: string; tokens: RegExp }[] = [
  { key: '99acres', name: '99acres', domain: '99acres.com', tokens: /99acres/ },
  { key: 'magicbricks', name: 'MagicBricks', domain: 'magicbricks.com', tokens: /magicbricks|magicbrick/ },
  { key: 'housing', name: 'Housing.com', domain: 'housing.com', tokens: /housing-?com/ },
  { key: 'nobroker', name: 'NoBroker', domain: 'nobroker.in', tokens: /nobroker/ },
  { key: 'commonfloor', name: 'CommonFloor', domain: 'commonfloor.com', tokens: /commonfloor/ },
];

const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'cutt.ly', 'rb.gy', 'shorturl.at', 'is.gd', 'ow.ly', 'tiny.cc', 'rebrand.ly', 'surl.li', 'shorturl.asia'];

export type Flag = 'notSecure' | 'shortener' | 'lookalike' | 'ipHost' | 'punycode';

export type Check =
  | { kind: 'invalid' }
  | { kind: 'ours'; host: string; flags: Flag[] }
  | { kind: 'portal'; host: string; portal: PortalKey; flags: Flag[] }
  | { kind: 'unknown'; host: string; flags: Flag[]; lookalikeOf?: PortalKey };

const isUnder = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

export function checkListingUrl(input: string): Check {
  const raw = input.trim();
  if (!raw || /\s/.test(raw)) return { kind: 'invalid' };
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { kind: 'invalid' };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { kind: 'invalid' };
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host.includes('.') && !host.startsWith('[')) return { kind: 'invalid' };

  const flags: Flag[] = [];
  if (url.protocol === 'http:') flags.push('notSecure');
  if (SHORTENERS.some((s) => isUnder(host, s))) flags.push('shortener');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[')) flags.push('ipHost');
  if (host.split('.').some((part) => part.startsWith('xn--'))) flags.push('punycode');

  if (isUnder(host, '360ghar.com')) return { kind: 'ours', host, flags };
  const portal = PORTALS.find((p) => isUnder(host, p.domain));
  if (portal) return { kind: 'portal', host, portal: portal.key, flags };
  const look = PORTALS.find((p) => p.tokens.test(host.replace(/\./g, '-')));
  if (look) {
    flags.push('lookalike');
    return { kind: 'unknown', host, flags, lookalikeOf: look.key };
  }
  return { kind: 'unknown', host, flags };
}
