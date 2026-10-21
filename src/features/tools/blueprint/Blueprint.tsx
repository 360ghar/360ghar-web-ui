import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { useIsClient } from '@/ui/react/useClient';
import { StateBlock } from '@/ui/states/StateBlock';
import { BP_UI } from './content';
import './blueprint.css';

const SRC = '/blueprint3d/index.html';
export const TIMEOUT_MS = 15_000;

type Props = { locale: Locale; title: string; loadingText: string };

/**
 * The vendored Blueprint3D app in a same-origin iframe. The iframe is added
 * after hydration. The app posts a ready message when it has started. If that has not
 * come after 15 s, an error with "Try again" replaces it.
 */
function Planner({ locale, title, loadingText }: Props) {
  const t = BP_UI[locale];
  const isClient = useIsClient();
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const frame = useRef<HTMLIFrameElement>(null);

  // Ready means the app finished starting (it says so), not only that the page loaded.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.source === frame.current?.contentWindow && e.data?.type === 'blueprint3d-ready') setStatus('ready');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!isClient || status !== 'loading') return;
    const id = window.setTimeout(() => setStatus('error'), TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [isClient, status, attempt]);

  if (status === 'error') {
    return (
      <div className="tool-desk bp-desk">
        <div className="tool-sheet bp-fail">
          <StateBlock
            scene="error"
            title={t.failTitle}
            body={t.failBody}
            action={{
              label: t.retry,
              onClick: () => {
                setStatus('loading');
                setAttempt((n) => n + 1);
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tool-desk bp-desk">
      <div className="bp-frame" aria-busy={status === 'loading'}>
        {isClient ? (
          <iframe
            key={attempt}
            ref={frame}
            className="bp-iframe"
            src={attempt ? `${SRC}?retry=${attempt}` : SRC}
            title={title}
            allow="fullscreen; clipboard-read; clipboard-write"
          />
        ) : null}
        {status === 'loading' ? (
          <p className="bp-loading" role="status">
            {loadingText}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function Blueprint(props: Props) {
  return (
    <IslandBoundary locale={props.locale}>
      <Planner {...props} />
    </IslandBoundary>
  );
}
