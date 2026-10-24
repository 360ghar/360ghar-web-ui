import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { TextAreaField } from '@/ui/react/Field';
import { Segmented } from '@/ui/react/Segmented';
import { toast } from '@/ui/react/Toaster';
import { useIsClient } from '@/ui/react/useClient';
import { StateBlock } from '@/ui/states/StateBlock';
import { useElapsed, useImagePick } from '../hooks';
import { ToolShell } from '../ui';
import { ACCEPT, elapsed, MAX_MB } from '../vastu/logic';
import { AID_UI } from './content';
import { addDesign, loadGallery, removeDesign, writeGallery, type Design } from './gallery';
import { buildPrompt, buildReimaginePrompt, MAX_PROMPT, ROOMS, STYLES, type DesignType, type Mode } from './prompts';
import { classifyError, fileToBase64, provider, type ErrorKind } from './provider';
import './ai-design.css';

type Strings = Record<string, string>;
type Props = { locale: Locale; strings: Strings };
type Result = { image: string; prompt: string; mode: Mode; original: string | null; settings: Design['settings'] };
type Phase = { at: 'idle' } | { at: 'loading'; since: number } | { at: 'error'; kind: ErrorKind } | { at: 'result'; r: Result };

const storage = () => window.localStorage;
const stamp = () => Date.now();

/** Draws the image on a canvas. Null when the image is cross-origin or fails. */
function toCanvas(src: string, mark: boolean): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = mark ? 1 : Math.min(1, 1024 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      const ctx = c.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      if (mark) {
        const size = Math.max(16, Math.round(c.width * 0.025));
        ctx.font = `700 ${size}px system-ui, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        const pad = size * 1.2;
        const w = ctx.measureText('360Ghar.com').width;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(c.width - pad - w - 8, c.height - pad - size - 4, w + 16, size + 12);
        ctx.fillStyle = 'rgba(28,13,7,0.7)';
        ctx.fillText('360Ghar.com', c.width - pad, c.height - pad);
      }
      resolve(c);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function withWatermark(src: string): Promise<string> {
  try {
    return (await toCanvas(src, true))?.toDataURL('image/png') ?? src;
  } catch {
    return src;
  }
}

/** A smaller JPEG copy for the gallery, so more designs fit in storage. */
async function forGallery(src: string): Promise<string> {
  try {
    return (await toCanvas(src, false))?.toDataURL('image/jpeg', 0.85) ?? src;
  } catch {
    return src;
  }
}

function Studio({ locale, strings }: Props) {
  const s = (k: string) => strings[k] ?? '';
  const t = AID_UI[locale];
  const isClient = useIsClient();
  const [mode, setMode] = useState<Mode>('text');
  const [designType, setDesignType] = useState<DesignType>('interior');
  const [room, setRoom] = useState('living-room');
  const [style, setStyle] = useState('modern');
  const [custom, setCustom] = useState('');
  const { file, preview, error: fileError, setError: setFileError, pick: pickFile, clear: clearFile } = useImagePick(s);
  const [phase, setPhase] = useState<Phase>({ at: 'idle' });
  const secs = useElapsed(phase.at === 'loading' ? phase.since : null);
  const [saved, setSaved] = useState(false);
  const [gallery, setGallery] = useState<Design[]>([]);
  const [cmp, setCmp] = useState(50);
  const busy = useRef(false);
  const out = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // localStorage is only readable after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGallery(loadGallery(storage()));
  }, []);

  const show = () => requestAnimationFrame(() => out.current?.scrollIntoView({ block: 'nearest' }));

  const generate = async () => {
    if (busy.current) return;
    if (mode === 'image' && !file) {
      setFileError(s('errorNoImage'));
      return;
    }
    show();
    busy.current = true;
    setPhase({ at: 'loading', since: stamp() });
    try {
      const prompt = mode === 'text' ? buildPrompt({ designType, room, style, custom }) : buildReimaginePrompt({ style, custom });
      const image = mode === 'text' ? await provider.txt2img(prompt) : await provider.img2img(prompt, await fileToBase64(file!));
      setSaved(false);
      setCmp(50);
      setPhase({ at: 'result', r: { image, prompt, mode, original: mode === 'image' ? preview : null, settings: { mode, designType, room, style } } });
      show();
    } catch (error) {
      setPhase({ at: 'error', kind: classifyError(error, navigator.onLine) });
    } finally {
      busy.current = false;
    }
  };

  const reset = () => {
    clearFile();
    setMode('text');
    setDesignType('interior');
    setRoom('living-room');
    setStyle('modern');
    setCustom('');
    setFileError(null);
    setPhase({ at: 'idle' });
  };

  const download = async (src: string) => {
    const a = document.createElement('a');
    a.href = await withWatermark(src);
    a.download = `360ghar-design-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async (src: string) => {
    try {
      const blob = await (await fetch(src)).blob();
      const f = new File([blob], '360ghar-design.png', { type: blob.type || 'image/png' });
      await navigator.share({ title: s('shareTitle'), text: s('shareText'), files: [f] });
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') toast(t.shareFail, 'error');
    }
  };

  const save = async (r: Result) => {
    const design: Design = { id: Date.now(), imageUrl: await forGallery(r.image), prompt: r.prompt, settings: r.settings, createdAt: new Date().toISOString() };
    const list = addDesign(storage(), design);
    setGallery(list);
    if (list.some((d) => d.id === design.id)) setSaved(true);
    else toast(t.full, 'error');
  };

  const clearAll = () => {
    const before = gallery;
    setGallery(writeGallery(storage(), []));
    toast(t.cleared, 'info', { label: t.undo, run: () => setGallery(writeGallery(storage(), before)) });
  };

  const openSaved = (d: Design) => {
    setSaved(true);
    setPhase({ at: 'result', r: { image: d.imageUrl, prompt: d.prompt, mode: d.settings.mode === 'image' ? 'image' : 'text', original: null, settings: d.settings } });
    show();
  };

  const busyNow = phase.at === 'loading';
  const rooms = ROOMS[designType];
  const chosen = STYLES.find((x) => x.id === style)!;
  const label = (list: { id: string; label: { en: string; hi: string } }[], id: string) => list.find((x) => x.id === id)?.label[locale] ?? id;

  return (
    <>
      <form
        className="tool-split"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        <div className="tool-sheet">
          <div className="aid-group">
            <h2 id="aid-mode" className="tool-sheet-title">
              {s('generationMode')}
            </h2>
            <Segmented
              radio
              className="aid-modes"
              optionClassName="aid-mode"
              labelledBy="aid-mode"
              value={mode}
              options={(['text', 'image'] as const).map(
                (m) =>
                  [
                    m,
                    <>
                      <span className="aid-mode-name">{m === 'text' ? s('modeCreate') : s('modeReimagine')}</span>
                      <span className="aid-mode-desc">{m === 'text' ? s('modeCreateDesc') : s('modeReimagineDesc')}</span>
                    </>,
                  ] as const,
              )}
              onChange={setMode}
            />
          </div>

          {mode === 'text' ? (
            <>
              <div className="aid-group">
                <p id="aid-type" className="field-label">
                  {s('designType')}
                </p>
                <Segmented
                  radio
                  className="aid-row"
                  labelledBy="aid-type"
                  value={designType}
                  options={(['interior', 'exterior'] as const).map((d) => [d, d === 'interior' ? s('typeInterior') : s('typeExterior')] as const)}
                  onChange={(d) => {
                    setDesignType(d);
                    setRoom(ROOMS[d][0]!.id);
                  }}
                />
              </div>
              <div className="aid-group">
                <p id="aid-room" className="field-label">
                  {designType === 'interior' ? s('roomType') : s('spaceType')}
                </p>
                <Segmented radio className="aid-row" labelledBy="aid-room" value={room} options={rooms.map((r) => [r.id, r.label[locale]] as const)} onChange={setRoom} />
              </div>
            </>
          ) : (
            <div className="aid-group">
              <p className="field-label">{s('sourcePhoto')}</p>
              {preview ? <img className="aid-source" src={preview} alt={s('sourcePreview')} /> : null}
              <label className={`aid-drop${preview ? ' is-small' : ''}`}>
                <input
                  type="file"
                  accept={ACCEPT.join(',')}
                  className="visually-hidden"
                  aria-label={t.photo}
                  aria-invalid={fileError ? true : undefined}
                  aria-describedby={fileError ? 'aid-file-error' : 'aid-file-hint'}
                  onChange={(e) => {
                    pickFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <Icon name="upload" size={24} className="aid-drop-icon" />
                <span className="font-bold">{preview ? t.change : s('dragDropPhoto')}</span>
                {preview ? null : <span className="tool-note">{s('orBrowse')}</span>}
                <span id="aid-file-hint" className="field-hint">
                  {s('photoTip')}. JPEG, PNG, WebP (max {MAX_MB} MB)
                </span>
              </label>
              {fileError ? (
                <p id="aid-file-error" className="field-error" role="alert">
                  <Icon name="alert" size={16} />
                  {fileError}
                </p>
              ) : null}
              {preview ? (
                <button type="button" className="btn btn-quiet justify-self-start -ml-3" onClick={clearFile}>
                  <Icon name="trash" size={18} />
                  {s('remove')}
                </button>
              ) : null}
            </div>
          )}
        </div>

        <div className="tool-sheet">
          <div className="aid-group">
            <h2 id="aid-style" className="tool-sheet-title">
              {s('designStyle')}
            </h2>
            <Segmented radio className="aid-row" labelledBy="aid-style" value={style} options={STYLES.map((x) => [x.id, x.label[locale]] as const)} onChange={setStyle} />
            <p className="tool-note" aria-live="polite">
              <strong className="text-ink-800">{chosen.label[locale]}:</strong> {chosen.desc[locale]}
            </p>
          </div>
          <TextAreaField
            label={s('customInstructions')}
            optional={locale === 'hi' ? '(वैकल्पिक)' : '(optional)'}
            rows={3}
            maxLength={MAX_PROMPT}
            value={custom}
            hint={`${s('promptNote')}. ${t.chars(custom.length, MAX_PROMPT)}`}
            onChange={(e) => setCustom(e.target.value.slice(0, MAX_PROMPT))}
          />
          <p className="aid-note">{t.note}</p>
          <div className="tool-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={busyNow}>
              {s('generateDesign')}
              <Icon name="arrow-up-right" size={18} className="arrow" />
            </button>
          </div>
        </div>
      </form>

      <div ref={out} className="aid-out">
        {phase.at === 'loading' ? (
          <section className="tool-result" role="status" aria-live="polite">
            <div>
              <h2 className="tool-result-label">{s('loadingCreating')}</h2>
              <p className="aid-step">{secs < 2 ? s('loadingUnderstanding') : secs < 15 ? s('loadingGenerating') : s('loadingEnhancing')}</p>
            </div>
            <div className="aid-track" aria-hidden="true">
              <span />
            </div>
            <p className="tool-result-sub tabular">
              {t.elapsed(elapsed(secs))} · {s('loadingNote')}
            </p>
          </section>
        ) : null}

        {phase.at === 'error' ? (
          <div className="tool-sheet">
            <StudioError kind={phase.kind} strings={strings} onRetry={() => void generate()} onReset={reset} />
          </div>
        ) : null}

        {phase.at === 'result' ? (
          <div className="tool-split">
            <section className="tool-sheet" aria-labelledby="aid-result">
              <h2 id="aid-result" className="tool-sheet-title">
                {phase.r.original ? s('beforeAfter') : s('designGenerated')}
              </h2>
              {phase.r.original ? (
                <div className="aid-compare-wrap">
                  <div className="aid-compare" style={{ '--cmp': `${cmp}%` } as CSSProperties}>
                    <img src={phase.r.original} alt={s('original')} />
                    <img className="aid-after" src={phase.r.image} alt={s('generatedAlt')} />
                    <span className="aid-divider" aria-hidden="true" />
                  </div>
                  <input type="range" className="tool-slider" min={0} max={100} value={cmp} aria-label={t.compare} aria-valuetext={`${cmp}%`} style={{ '--pct': `${cmp}%` } as CSSProperties} onChange={(e) => setCmp(Number(e.target.value))} />
                  <p className="aid-compare-legend">
                    <span>{s('original')}</span>
                    <span>{s('aiRedesign')}</span>
                  </p>
                  <p className="tool-note">{s('dragSlider')}</p>
                </div>
              ) : (
                <img className="aid-image" src={phase.r.image} alt={s('generatedAlt')} data-testid="aid-image" />
              )}
            </section>
            <section className="tool-result" aria-label={s('designGenerated')}>
              <dl className="tool-stats">
                <div>
                  <dt>{s('generationMode')}</dt>
                  <dd>{phase.r.mode === 'text' ? s('modeCreate') : s('modeReimagine')}</dd>
                </div>
                {phase.r.mode === 'text' ? (
                  <div>
                    <dt>{phase.r.settings.designType === 'interior' ? s('roomType') : s('spaceType')}</dt>
                    <dd>{label(ROOMS[phase.r.settings.designType === 'exterior' ? 'exterior' : 'interior'], phase.r.settings.room)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>{s('designStyle')}</dt>
                  <dd>{STYLES.find((x) => x.id === phase.r.settings.style)?.label[locale] ?? phase.r.settings.style}</dd>
                </div>
              </dl>
              <div className="tool-actions">
                <button type="button" className="btn" onClick={() => void download(phase.r.image)}>
                  <Icon name="download" size={18} />
                  {s('download')}
                </button>
                <button type="button" className="btn" disabled={saved} onClick={() => void save(phase.r)}>
                  <Icon name={saved ? 'check' : 'heart'} size={18} />
                  {saved ? s('saved') : s('saveToGallery')}
                </button>
                {isClient && typeof navigator.share === 'function' ? (
                  <button type="button" className="btn" onClick={() => void share(phase.r.image)}>
                    <Icon name="share" size={18} />
                    {s('share')}
                  </button>
                ) : null}
                <button type="button" className="btn" onClick={() => void generate()}>
                  <Icon name="retry" size={18} />
                  {s('regenerate')}
                </button>
                <button type="button" className="btn btn-quiet" onClick={reset}>
                  {s('newDesign')}
                </button>
              </div>
              <details className="aid-prompt">
                <summary>{s('viewPrompt')}</summary>
                <p>{phase.r.prompt}</p>
              </details>
            </section>
          </div>
        ) : null}
      </div>

      {gallery.length ? (
        <section className="tool-sheet" aria-labelledby="aid-gallery">
          <div className="aid-gallery-head">
            <h2 id="aid-gallery" className="tool-sheet-title">
              {s('yourDesigns')} <span className="tool-note tabular">({gallery.length})</span>
            </h2>
            <button type="button" className="btn btn-quiet" onClick={clearAll}>
              <Icon name="trash" size={18} />
              {s('clearAll')}
            </button>
          </div>
          <ul className="aid-gallery">
            {gallery.map((d, i) => (
              <li key={d.id}>
                <button type="button" className="aid-thumb" aria-label={t.open(i + 1)} onClick={() => openSaved(d)}>
                  <img src={d.imageUrl} alt="" loading="lazy" />
                </button>
                <button type="button" className="btn btn-icon aid-del" aria-label={t.del(i + 1)} onClick={() => setGallery(removeDesign(storage(), d.id))}>
                  <Icon name="close" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function StudioError({ kind, strings, onRetry, onReset }: { kind: ErrorKind; strings: Strings; onRetry: () => void; onReset: () => void }) {
  const s = (k: string) => strings[k] ?? '';
  const text: Record<ErrorKind, [string, string, string]> = {
    quota: [s('errorQuota'), s('errorQuotaMsg'), 'Quota'],
    timeout: [s('errorTimeout'), s('errorTimeoutMsg'), 'Timeout'],
    network: [s('errorConnection'), s('errorNetworkMsg'), 'Network'],
    general: [s('errorGeneral'), s('errorGeneralMsg'), 'General'],
  };
  const [title, body, group] = text[kind];
  return (
    <StateBlock
      compact
      scene={kind === 'network' ? 'offline' : 'error'}
      title={title}
      body={body}
      action={{ label: s('tryAgain'), onClick: onRetry }}
      secondary={{ label: s('startOver'), onClick: onReset }}
    >
      <div className="aid-suggest">
        <p className="font-semibold">{s('suggestions')}</p>
        <ul>
          {[1, 2, 3].map((i) => (
            <li key={i}>{s(`suggestion${group}${i}`)}</li>
          ))}
        </ul>
      </div>
    </StateBlock>
  );
}

export default function AiDesignStudio(props: Props) {
  return (
    <ToolShell locale={props.locale}>
      <Studio {...props} />
    </ToolShell>
  );
}
