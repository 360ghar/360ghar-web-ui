import { useState } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { FAKE_UI } from './content';
import { checkListingUrl, PORTALS, type Check } from './rules';
import './fake.css';

type Props = { locale: Locale };

function Checker({ locale }: Props) {
  const t = FAKE_UI[locale];
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<Check | null>(null);

  const invalid = result?.kind === 'invalid';
  const done = result && result.kind !== 'invalid' ? result : null;
  const portal = done?.kind === 'portal' ? PORTALS.find((p) => p.key === done.portal)! : null;
  const look = done?.kind === 'unknown' && done.lookalikeOf ? PORTALS.find((p) => p.key === done.lookalikeOf)! : null;
  const flagged = Boolean(done?.flags.some((f) => f !== 'notSecure'));
  const title = !done ? '' : flagged ? t.careTitle : done.kind === 'ours' ? t.oursTitle : portal ? t.portalTitle(portal.name) : t.unknownTitle;
  const sub = !done ? '' : flagged ? t.careSub : done.kind === 'ours' ? t.oursSub : portal ? t.portalSub(portal.name) : t.unknownSub;

  return (
    <div className="tool-desk">
      <form
        className="tool-sheet"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setResult(checkListingUrl(url));
        }}
      >
        <div className="fake-row">
          <TextField
            label={t.label}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder={t.placeholder}
            value={url}
            error={invalid ? t.invalid : undefined}
            onChange={(e) => {
              setUrl(e.target.value);
              if (result) setResult(null);
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={!url.trim()}>
            <Icon name="search" size={18} />
            {t.check}
          </button>
        </div>
        <p className="tool-note">{t.rulesNote}</p>
      </form>

      {done ? (
        <div className="tool-split" aria-live="polite">
          <section className="tool-result" aria-labelledby="fake-verdict">
            <div>
              <h2 id="fake-verdict" className="fake-verdict">
                {title}
              </h2>
              <p className="tool-result-sub">{sub}</p>
              <p className="tool-result-sub fake-host">{done.host}</p>
            </div>
            {done.flags.length ? (
              <div>
                <h3 className="tool-result-label">{t.linkChecks}</h3>
                <ul className="fake-flags">
                  {done.flags.map((f) => (
                    <li key={f}>
                      <Icon name="alert" size={18} />
                      <span>{t.flags[f](done.host, look?.name ?? '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="tool-sheet" aria-labelledby="fake-points">
            <div>
              <h2 id="fake-points" className="tool-sheet-title">{t.checklistTitle}</h2>
              <ul className="fake-list">
                {t.checklist.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default function FakeListing(props: Props) {
  return (
    <IslandBoundary locale={props.locale}>
      <Checker {...props} />
    </IslandBoundary>
  );
}
