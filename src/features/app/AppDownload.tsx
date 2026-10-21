import { useSyncExternalStore } from 'react';

type Os = 'android' | 'ios' | 'other';
type Props = {
  /** The notice for each phone. A desktop gets the QR code. */
  notice: { android: string; ios: string };
  qr: { size: number; path: string };
  qrLabel: string;
};

const subscribe = () => () => {};

export function osOf(nav: Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'>): Os {
  if (/Android/i.test(nav.userAgent)) return 'android';
  // iPadOS reports itself as a Mac with a touch screen.
  if (/iPhone|iPad|iPod/i.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)) return 'ios';
  return 'other';
}

const detectOs = () => osOf(navigator);

/**
 * Tells the visitor which store fits their phone. Without JavaScript, and on a desktop, it shows the
 * QR code of this page (hidden by CSS on a phone-size screen, so the phone never flashes it).
 */
export default function AppDownload({ notice, qr, qrLabel }: Props) {
  // The server and the first client render say 'other'; React then reads the real phone.
  const os = useSyncExternalStore(subscribe, detectOs, () => 'other' as Os);

  if (os !== 'other') {
    return (
      <p className="app-os" role="status">
        {notice[os]}
      </p>
    );
  }
  const pad = 2;
  const box = qr.size + pad * 2;
  return (
    <figure className="app-qr">
      <svg viewBox={`${-pad} ${-pad} ${box} ${box}`} role="img" aria-label={qrLabel} shapeRendering="crispEdges">
        <rect x={-pad} y={-pad} width={box} height={box} fill="var(--color-paper)" />
        <path d={qr.path} fill="var(--color-ink-950)" />
      </svg>
      <figcaption>{qrLabel}</figcaption>
    </figure>
  );
}
