import { useEffect, useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';
import { renderMarkdown } from '@/features/chat/markdown';
import { describeError } from '@/lib/api/errors';
import { formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import type { IconName } from '@/ui/icons/paths';
import { TextAreaField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { toast, Toaster } from '@/ui/react/Toaster';
import { StateBlock } from '@/ui/states/StateBlock';
import { copyText } from '@/ui/react/share';
import { useElapsed, useImagePick } from '../hooks';
import { VASTU_UI } from './content';
import {
  ACCEPT,
  analyze,
  elapsed,
  fill,
  MAX_NOTES,
  NORTH,
  scoreBand,
  scoreStats,
  statusOf,
  STATUS_RANK,
  zoneAt,
  zoneOf,
  zoneSummary,
  type North,
  type Status,
  type VastuResponse,
  type VastuResult,
  type Zone,
} from './logic';
import './vastu.css';

type Strings = Record<string, string>;
type Props = { locale: Locale; strings: Strings };
type Ui = (typeof VASTU_UI)['en'];
type Phase = { at: 'input' } | { at: 'loading'; since: number } | { at: 'error'; error: unknown } | { at: 'result'; res: VastuResponse & { data: VastuResult } };

const DIR_DESC: Record<North, string> = { up: 'dirTopDesc', right: 'dirRightDesc', down: 'dirBottomDesc', left: 'dirLeftDesc', unknown: 'dirUnknownDesc' };
const DIR_ICON: Record<North, IconName> = { up: 'chevron-up', right: 'chevron-right', down: 'chevron-down', left: 'chevron-left', unknown: 'compass' };
const WARNING_KEY: Record<string, string> = {
  not_floor_plan: 'warningNotFloorPlan',
  missing_kitchen: 'warningMissingKitchen',
  missing_bedroom: 'warningMissingBedroom',
  missing_bathroom: 'warningMissingBathroom',
  missing_entrance: 'warningMissingEntrance',
  few_rooms_detected: 'warningFewRooms',
  unclear_layout: 'warningUnclearLayout',
  low_image_quality: 'warningLowQuality',
  partial_analysis: 'warningPartialAnalysis',
  ambiguous_directions: 'warningAmbiguousDirections',
};

const CELLS = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [r, c] as const));
const NORTH_ANGLE: Record<North, number> = { up: 0, right: 90, down: 180, left: 270, unknown: 0 };
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STATUS_TONE: Record<Status, string> = { excellent: 'is-good', good: 'is-good', neutral: '', concerning: 'is-warn', problematic: 'is-bad' };
const STATUS_ICON: Record<Status, IconName | null> = { excellent: 'check', good: 'check', neutral: 'info', concerning: 'alert', problematic: 'alert' };
const SEVERITY_TONE: Record<string, string> = { high: 'is-bad', critical: 'is-bad', medium: 'is-warn', warning: 'is-warn', low: '', info: '' };
const SEVERITY_RANK: Record<string, number> = { critical: 4, high: 3, medium: 2, warning: 2, low: 1, info: 0 };
const SEVERITY_ICON: Record<string, IconName | null> = { critical: 'alert', high: 'alert', medium: 'info', warning: 'info', low: null, info: null };

/** An arrow and "N" on the side of the plan where north is. The arrow takes the short way round. */
function NorthMarker({ dir, label }: { dir: North; label: string }) {
  const [turn, setTurn] = useState({ dir, angle: NORTH_ANGLE[dir] });
  // Turn by the short way: the angle keeps counting past 360 instead of jumping back.
  if (turn.dir !== dir) {
    const delta = dir === 'unknown' ? 0 : ((((NORTH_ANGLE[dir] - turn.angle) % 360) + 540) % 360) - 180;
    setTurn({ dir, angle: turn.angle + delta });
  }
  const angle = turn.angle;
  return (
    <svg className="vastu-marker" viewBox="0 0 28 28" width="28" height="28" role="img" aria-label={label}>
      <g className="vastu-marker-arrow" style={{ transform: `rotate(${angle}deg)` }}>
        <path d="M9 8.5 L14 3 L19 8.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="14" y="15" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="800" fill="currentColor">
        N
      </text>
    </svg>
  );
}

type FrameProps = {
  src: string | null;
  alt: string;
  north: North;
  t: Ui;
  /** Draw the zone lines and codes on the plan. */
  zones?: boolean;
  /** Zone colours for the codes (report only). */
  tones?: Partial<Record<Zone, Status | null>>;
  scanning?: boolean;
  drag?: boolean;
  drop?: { onDragOver: (e: DragEvent) => void; onDragLeave: () => void; onDrop: (e: DragEvent) => void };
  children?: ReactNode;
};

/**
 * The plan table: a frame with the person's plan in it (or nine zone tiles
 * while there is none) and the north marker on the edge. The zones follow the
 * marker, so a wrong north shows at once.
 */
function PlanFrame({ src, alt, north, t, zones, tones, scanning, drag, drop, children }: FrameProps) {
  const [ratio, setRatio] = useState(1);
  const overlay = !!src && north !== 'unknown' && (zones || scanning);
  const codeAt = (r: number, c: number) => zoneAt(r, c, north);
  return (
    <div className="vastu-table" data-north={north} style={{ '--ar': src ? ratio : 1 } as CSSProperties}>
      <div className={`vastu-frame${drag ? ' is-drag' : ''}${src ? ' has-image' : ''}`} {...drop}>
        {src ? (
          <img
            className="vastu-img"
            src={src}
            alt={alt}
            onLoad={(e) => {
              const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
              if (w && h) setRatio(Math.min(1.5, Math.max(0.7, w / h)));
            }}
          />
        ) : (
          <div className="vastu-tiles" aria-hidden="true">
            {CELLS.map(([r, c]) => {
              const z = codeAt(r, c);
              return (
                <span key={`${r}${c}`} className="vastu-tile" data-r={r} data-c={c}>
                  <b>{z}</b>
                  <i>{t.zoneNames[z]}</i>
                </span>
              );
            })}
          </div>
        )}
        {overlay ? (
          <div className="vastu-zones" aria-hidden="true">
            {CELLS.map(([r, c]) => {
              const z = codeAt(r, c);
              const st = tones?.[z];
              return (
                <span key={`${r}${c}`} className="vastu-zone">
                  <b className={`vastu-chip ${st ? STATUS_TONE[st] : ''}`}>{z}</b>
                </span>
              );
            })}
          </div>
        ) : null}
        {scanning ? <span className="vastu-scan" aria-hidden="true" /> : null}
        {children}
      </div>
      <NorthMarker dir={north} label={t.planLabel(t.dirs[north])} />
    </div>
  );
}

function Vastu({ locale, strings }: Props) {
  const s = (k: string) => strings[k] ?? '';
  const t = VASTU_UI[locale];
  const { file, preview, error: fileError, setError: setFileError, pick, clear: clearFile } = useImagePick(s);
  const [north, setNorth] = useState<North>('up');
  const [notes, setNotes] = useState('');
  const [drag, setDrag] = useState(false);
  const [zones, setZones] = useState(true);
  const [phase, setPhase] = useState<Phase>({ at: 'input' });
  const secs = useElapsed(phase.at === 'loading' ? phase.since : null);
  const abort = useRef<AbortController | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLDivElement>(null);

  useEffect(() => () => abort.current?.abort(), []);

  // Bring the waiting panel or the error into view (on phones it is below the form).
  useEffect(() => {
    if (phase.at === 'loading' || phase.at === 'error') status.current?.scrollIntoView({ block: 'nearest' });
  }, [phase.at]);

  const submit = async () => {
    if (!file) {
      setFileError(s('validationNoFile'));
      return;
    }
    const controller = new AbortController();
    abort.current = controller;
    setPhase({ at: 'loading', since: Date.now() });
    try {
      const res = await analyze(file, north, notes.trim(), controller.signal);
      setPhase({ at: 'result', res });
      requestAnimationFrame(() => top.current?.scrollIntoView({ block: 'start' }));
    } catch (error) {
      if (controller.signal.aborted) setPhase({ at: 'input' });
      else setPhase({ at: 'error', error });
    } finally {
      abort.current = null;
    }
  };

  const reset = () => {
    clearFile();
    setNorth('up');
    setNotes('');
    setFileError(null);
    setPhase({ at: 'input' });
    requestAnimationFrame(() => top.current?.scrollIntoView({ block: 'start' }));
  };

  if (phase.at === 'result') {
    return (
      <div ref={top} className="vastu-top">
        <Report res={phase.res} preview={preview} north={north} strings={strings} locale={locale} onReset={reset} />
        <Toaster />
      </div>
    );
  }

  const loading = phase.at === 'loading';
  const fileId = 'vastu-file';
  const drop = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      if (!loading) setDrag(true);
    },
    onDragLeave: () => setDrag(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setDrag(false);
      if (!loading) pick(e.dataTransfer.files[0]);
    },
  };

  return (
    <div ref={top} className="tool-desk vastu-top">
      <form
        className="tool-split vastu-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="tool-sheet">
          <fieldset className="vastu-fieldset" disabled={loading}>
            <legend className="tool-sheet-title vastu-legend">{s('floorPlanImage')}</legend>
            <div className="vastu-fields">
              <input
                id={fileId}
                type="file"
                accept={ACCEPT.join(',')}
                className="visually-hidden"
                aria-label={s('floorPlanImage')}
                aria-invalid={fileError ? true : undefined}
                aria-describedby={fileError ? `${fileId}-error` : `${fileId}-hint`}
                onChange={(e) => {
                  pick(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <PlanFrame src={preview} alt={s('floorPlanPreview')} north={north} t={t} zones={zones} scanning={loading} drag={drag} drop={drop}>
                {preview ? null : (
                  <label htmlFor={fileId} className="vastu-drop">
                    <span className="vastu-slip-card">
                      <Icon name="upload" size={28} className="vastu-drop-icon" />
                      <span className="vastu-drop-main">{s('dragDrop')}</span>
                      <span className="vastu-drop-sub">{s('orBrowse')}</span>
                    </span>
                  </label>
                )}
              </PlanFrame>
              <p id={`${fileId}-hint`} className="field-hint">
                {s('fileTypes')}
                {preview ? ` · ${file?.name} · ${((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB` : ''}
              </p>
              {fileError ? (
                <p id={`${fileId}-error`} className="field-error" role="alert">
                  <Icon name="alert" size={16} />
                  {fileError}
                </p>
              ) : null}
              {preview ? (
                <div className="tool-actions">
                  <label htmlFor={fileId} className="btn">
                    <Icon name="upload" size={18} />
                    {t.change}
                  </label>
                  <button type="button" className="btn btn-quiet" onClick={clearFile}>
                    <Icon name="trash" size={18} />
                    {s('remove')}
                  </button>
                  {north === 'unknown' ? null : (
                    <button type="button" className="btn btn-quiet" onClick={() => setZones((z) => !z)}>
                      <Icon name="floor-plan" size={18} />
                      {zones ? t.zonesHide : t.zonesShow}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </fieldset>
        </div>

        <div className="tool-stack">
          <div className="tool-sheet">
            <fieldset className="vastu-fieldset" disabled={loading}>
              <legend className="tool-sheet-title vastu-legend">{s('northDirection')}</legend>
              <div className="vastu-fields">
                <div className="vastu-dirs">
                  {NORTH.map((d) => (
                    <label key={d} className={`toggle vastu-dir is-${d}`}>
                      <input type="radio" name="north" value={d} checked={north === d} onChange={() => setNorth(d)} className="visually-hidden" />
                      <Icon name={DIR_ICON[d]} size={18} />
                      <span>{t.dirs[d]}</span>
                    </label>
                  ))}
                </div>
                <p className="tool-note" aria-live="polite">
                  {s(DIR_DESC[north])}
                  {locale === 'hi' ? '। ' : '. '}
                  {s('northHint')}
                </p>
                <TextAreaField
                  label={s('additionalNotes')}
                  optional={s('optional')}
                  value={notes}
                  maxLength={MAX_NOTES}
                  rows={4}
                  placeholder={s('notesPlaceholder')}
                  hint={fill(s('charactersCount'), { count: notes.length })}
                  onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES))}
                />
                {loading ? null : (
                  <button type="submit" className="btn btn-primary btn-lg">
                    {s('analyzeVastu')}
                    <Icon name="arrow-up-right" size={18} className="arrow" />
                  </button>
                )}
              </div>
            </fieldset>
          </div>

          <div ref={status} className="vastu-status">
            {loading ? (
              <section className="tool-result vastu-loading" role="status" aria-live="polite">
                <div>
                  <h2 className="tool-result-label">{t.working}</h2>
                  <p className="vastu-loading-title">{secs < 8 ? s('loadingAnalyzingTitle') : s('loadingGeneratingTitle')}</p>
                  <p className="tool-result-sub">{secs < 8 ? s('loadingAnalyzingDesc') : s('loadingGeneratingDesc')}</p>
                </div>
                <p className="tool-result-sub tabular">
                  {t.elapsed(elapsed(secs))} · {s('loadingTime')}
                </p>
                <button type="button" className="btn btn-quiet justify-self-start" onClick={() => abort.current?.abort()}>
                  <Icon name="close" size={18} />
                  {t.cancel}
                </button>
              </section>
            ) : null}

            {phase.at === 'error' ? <ErrorPanel error={phase.error} locale={locale} strings={strings} onRetry={() => void submit()} onNewImage={reset} /> : null}
          </div>
        </div>
      </form>
      <Toaster />
    </div>
  );
}

function ErrorPanel({ error, locale, strings, onRetry, onNewImage }: { error: unknown; locale: Locale; strings: Strings; onRetry: () => void; onNewImage: () => void }) {
  const s = (k: string) => strings[k] ?? '';
  const { title, body, kind } = describeError(error, locale);
  const group = kind === 'network' ? 'Network' : kind === 'timeout' ? 'Timeout' : kind === 'bad_request' || kind === 'validation' ? 'Validation' : 'General';
  return (
    <div className="tool-sheet">
      <StateBlock
        compact
        scene={kind === 'network' ? 'offline' : 'error'}
        title={title}
        body={body}
        action={{ label: s('tryAgain'), onClick: onRetry }}
        secondary={{ label: s('uploadDifferentImage'), onClick: onNewImage }}
      >
        <div className="vastu-suggest">
          <p className="font-semibold">{s('suggestions')}</p>
          <ul>
            {[1, 2, 3].map((i) => (
              <li key={i}>{s(`suggestion${group}${i}`)}</li>
            ))}
          </ul>
        </div>
      </StateBlock>
    </div>
  );
}

type Zones = ReturnType<typeof zoneSummary>['zones'];

/** The eight directions and the centre, north at the top, each cell toned by its worst room. */
function ZoneMap({ zones, other, active, onPick, t }: { zones: Zones; other: { name: string }[]; active: Zone | null; onPick: (z: Zone) => void; t: Ui }) {
  const status = (st: Status) => (t.statuses as Record<string, string>)[st] ?? st;
  return (
    <>
      <div className="vastu-map">
        {CELLS.map(([r, c]) => {
          const z = zoneAt(r, c, 'up');
          const info = zones[z];
          const st = info.status;
          const icon = st ? STATUS_ICON[st] : null;
          const kind = !info.rooms.length ? 'is-empty' : st ? STATUS_TONE[st] || 'is-plain' : 'is-plain';
          return (
            <button
              key={z}
              type="button"
              className={`vastu-cell ${kind}${active === z ? ' is-active' : ''}`}
              aria-pressed={active === z}
              disabled={!info.rooms.length}
              onClick={() => onPick(z)}
            >
              <span className="vastu-cell-head">
                <b className="vastu-cell-code">{z === 'C' ? t.zoneCentre : z}</b>
                <span className="vastu-cell-name">{t.zoneNames[z]}</span>
              </span>
              <span className="vastu-cell-rooms">{info.rooms.length ? info.rooms.map((x) => x.name).join(', ') : t.noRooms}</span>
              {info.rooms.length ? (
                <span className="vastu-cell-status">
                  {icon ? <Icon name={icon} size={16} /> : null}
                  {st ? status(st) : t.notRated}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {other.length ? (
        <p className="tool-note">
          {t.otherRooms}: {other.map((x) => x.name).join(', ')}
        </p>
      ) : null}
    </>
  );
}

function Report({ res, preview, north, strings, locale, onReset }: { res: VastuResponse & { data: VastuResult }; preview: string | null; north: North; strings: Strings; locale: Locale; onReset: () => void }) {
  const s = (k: string) => strings[k] ?? '';
  const t = VASTU_UI[locale];
  const d = res.data;
  const score = Math.min(10, Math.max(0, Math.round(Number(d.vastu_score) || 0)));
  const band = scoreBand(score);
  const conf = d.analysis_confidence ?? 1;
  const warnings = d.warnings ?? [];
  const plan = d.floor_plan_analysis;
  const critical = res.critical_warnings || warnings.some((w) => w.severity === 'critical');
  const label = (map: Record<string, string>, key: string) => map[key.toLowerCase()] ?? key;
  const markdown = res.report_markdown ?? '';
  const analysis = d.room_analysis ?? [];
  const defects = [...(d.major_defects ?? [])].sort((a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0));
  const stats = scoreStats(analysis, defects.length);
  const { zones, other } = zoneSummary(plan?.rooms ?? [], analysis);
  const tones = Object.fromEntries(Object.entries(zones).map(([z, i]) => [z, i.status])) as Partial<Record<Zone, Status | null>>;
  // Worst first; a room with a status this build does not know comes last.
  const rank = (st: Status | null) => (st === null ? -1 : STATUS_RANK[st]);
  const rooms = analysis.map((r, i) => ({ r, i, st: statusOf(r.status), zone: zoneOf(r.direction) })).sort((a, b) => rank(b.st) - rank(a.st) || a.i - b.i);
  const [active, setActive] = useState<Zone | null>(null);

  const pickZone = (z: Zone) => {
    setActive((a) => (a === z ? null : z));
    const hit = rooms.find((x) => x.zone === z);
    if (hit) document.getElementById(`vastu-room-${hit.i}`)?.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
  };

  const copy = async () => {
    const ok = await copyText(markdown);
    toast(ok ? s('reportCopied') : s('reportCopyFailed'), ok ? 'success' : 'error');
  };

  const facts: [string, string][] = plan
    ? ([
        [s('plotShape'), plan.plot_shape ?? ''],
        [s('mainEntrance'), plan.entrance?.direction ?? ''],
        [s('kitchen'), plan.kitchen?.direction ?? ''],
        [fill(s('toilets'), { count: plan.toilets?.count ?? 0 }), (plan.toilets?.directions ?? []).join(', ')],
        [s('staircase'), plan.staircase && plan.staircase.direction !== 'None' ? plan.staircase.direction : ''],
      ].filter(([, v]) => v) as [string, string][])
    : [];

  const stat = (k: string, v: string | number) => (
    <div key={k}>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );

  return (
    <div className="tool-desk tool-print-area vastu-report">
      <p className="tool-note">{t.resultCaveat}</p>
      <p className="vastu-print-head">
        {t.printTitle}
        {res.analyzed_at ? ` · ${formatDate(res.analyzed_at, locale, { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
      </p>

      <section className="tool-result vastu-slip" aria-labelledby="vastu-score">
        <div className="vastu-slip-main">
          <h2 id="vastu-score" className="tool-result-label">
            {t.score}
          </h2>
          <p className="tool-figure" data-testid="vastu-score">
            {score}
            <span className="tool-figure-unit">{s('outOf10')}</span>
          </p>
          <div className="vastu-meter" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={i < score ? 'is-on' : ''} style={{ '--i': i } as CSSProperties} />
            ))}
          </div>
          <p className="vastu-band">{s(`score${band}`)}</p>
          <p className="tool-result-sub">{s(`scoreDesc${band}`)}</p>
        </div>
        <div className="vastu-slip-side">
          {d.score_explanation ? <p className="vastu-explain">{d.score_explanation}</p> : null}
          <dl className="tool-stats vastu-stats">
            {stat(t.statRooms, stats.rooms)}
            {stat(t.statGood, stats.good)}
            {stat(t.statAttention, stats.attention)}
            {stat(t.statDefects, stats.defects)}
            {stat(s('analysisConfidence'), `${Math.round(conf * 100)}%`)}
          </dl>
          {conf < 0.8 ? <p className="tool-result-sub">{s('confidenceNote')}</p> : null}
          <div className="tool-actions tool-noprint">
            <button type="button" className="btn" onClick={() => void copy()}>
              <Icon name="copy" size={18} />
              {s('copyReport')}
            </button>
            <button type="button" className="btn" onClick={() => window.print()} title={t.printHint}>
              <Icon name="print" size={18} />
              {t.print}
            </button>
            <button type="button" className="btn btn-quiet" onClick={onReset}>
              <Icon name="retry" size={18} />
              {s('analyzeAnother')}
            </button>
          </div>
        </div>
      </section>

      <div className="tool-split vastu-plans">
        <section className="tool-sheet vastu-mapsheet" aria-labelledby="vastu-map">
          <div>
            <h2 id="vastu-map" className="tool-sheet-title">
              {t.zoneMap}
            </h2>
            <p className="tool-note vastu-map-note">{t.zoneMapNote}</p>
          </div>
          <ZoneMap zones={zones} other={other} active={active} onPick={pickZone} t={t} />
        </section>

        <section className="tool-sheet" aria-labelledby="vastu-plan">
          <h2 id="vastu-plan" className="tool-sheet-title">
            {t.yourPlan}
          </h2>
          {preview ? <PlanFrame src={preview} alt={s('floorPlanPreview')} north={north} t={t} zones tones={tones} /> : null}
          {facts.length ? (
            <dl className="tool-lines">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {plan?.center_area ? (
            <p className="tool-note">
              {s('centerBrahmasthan')}: {plan.center_area}
            </p>
          ) : null}
        </section>
      </div>

      {warnings.length || d.is_valid_floor_plan === false ? (
        <section className={`tool-sheet vastu-warnings ${critical ? 'is-critical' : ''}`} aria-labelledby="vastu-warn">
          <h2 id="vastu-warn" className="tool-sheet-title vastu-title-icon">
            <Icon name="alert" size={24} />
            {critical ? s('warningCriticalTitle') : s('warningNotesTitle')}
          </h2>
          {d.is_valid_floor_plan === false ? (
            <div className="vastu-invalid">
              <p>
                <strong>{s('notFloorPlanMsg')}</strong> {s('notFloorPlanNote')}
              </p>
              <button type="button" className="btn btn-ink tool-noprint" onClick={onReset}>
                <Icon name="upload" size={18} />
                {s('uploadNewImage')}
              </button>
            </div>
          ) : null}
          <ul className="vastu-list">
            {warnings.map((w, i) => (
              <li key={i}>
                <p className="vastu-item-head">
                  <strong>{s(WARNING_KEY[w.type] ?? '') || w.type}</strong>
                  <span className={`vastu-tone ${SEVERITY_TONE[w.severity] ?? ''}`}>{label(t.severity, w.severity)}</span>
                </p>
                <p>{w.message}</p>
                {w.suggestion ? <p className="tool-note">{w.suggestion}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {rooms.length ? (
        <section className="tool-sheet" aria-labelledby="vastu-rooms">
          <div>
            <h2 id="vastu-rooms" className="tool-sheet-title">
              {s('roomAnalysis')}
            </h2>
            <p className="tool-note vastu-map-note">{t.roomsNote}</p>
          </div>
          <ul className="vastu-rooms">
            {rooms.map(({ r, i, st, zone }) => {
              const icon = st ? STATUS_ICON[st] : null;
              return (
                <li key={i} id={`vastu-room-${i}`} className={`vastu-room${zone && zone === active ? ' is-active' : ''}`}>
                  <p className="vastu-room-code">
                    <span className="visually-hidden">{t.direction}: </span>
                    {zone ?? '?'}
                  </p>
                  <div className="vastu-room-body">
                    <p className="vastu-item-head">
                      <strong>
                        {r.room}
                        {zone ? null : <span className="tool-note"> ({r.direction})</span>}
                      </strong>
                      <span className={`vastu-tone ${st ? STATUS_TONE[st] : ''}`}>
                        {icon ? <Icon name={icon} size={16} /> : null}
                        {st ? label(t.statuses, st) : t.notRated}
                      </span>
                    </p>
                    <p>{r.analysis}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="tool-split">
        <section className="tool-sheet" aria-labelledby="vastu-defects">
          <h2 id="vastu-defects" className="tool-sheet-title">
            {s('majorDefects')}
          </h2>
          {defects.length ? (
            <ol className="vastu-steps">
              {defects.map((x, i) => {
                const icon = SEVERITY_ICON[x.severity];
                return (
                  <li key={i}>
                    <span className="vastu-num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div className="vastu-step-body">
                      <p className="vastu-item-head">
                        <strong>{x.issue}</strong>
                      </p>
                      <p className={`vastu-tone ${SEVERITY_TONE[x.severity] ?? ''}`}>
                        {icon ? <Icon name={icon} size={16} /> : null}
                        {t.severityLabel}: {label(t.severity, x.severity)}
                      </p>
                      <p>{x.impact}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="tool-note">{t.none}</p>
          )}
        </section>
        <section className="tool-sheet" aria-labelledby="vastu-remedies">
          <h2 id="vastu-remedies" className="tool-sheet-title">
            {s('recommendedRemedies')}
          </h2>
          {d.remedies?.length ? (
            <ol className="vastu-steps">
              {d.remedies.map((x, i) => (
                <li key={i}>
                  <span className="vastu-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="vastu-step-body">
                    <p className="vastu-item-head">
                      <strong>{x.problem}</strong>
                    </p>
                    <p className="tool-note">
                      {String(x.type)
                        .split('|')
                        .map((p) => label(t.remedyType, p.trim()))
                        .join(' / ')}
                    </p>
                    <p>{x.solution}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="tool-note">{t.none}</p>
          )}
        </section>
      </div>

      {d.improvements?.length ? (
        <section className="tool-sheet" aria-labelledby="vastu-improve">
          <h2 id="vastu-improve" className="tool-sheet-title">
            {s('suggestedImprovements')}
          </h2>
          <ul className="vastu-bullets">
            {d.improvements.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {markdown ? (
        <details className="tool-sheet tool-details tool-noprint">
          <summary>
            {s('fullAnalysisReport')}
            <Icon name="chevron-down" size={22} className="tool-details-icon" />
          </summary>
          {/* renderMarkdown escapes all HTML before it adds formatting. */}
          <div className="vastu-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }} />
        </details>
      ) : null}

      <section className="vastu-fine" aria-label={t.disclaimer}>
        {d.assumptions?.length ? (
          <p>
            <strong>{t.assumptions}:</strong> {d.assumptions.join(' ')}
          </p>
        ) : null}
        {d.disclaimer ? (
          <p>
            <strong>{t.disclaimer}:</strong> {d.disclaimer}
          </p>
        ) : null}
      </section>
    </div>
  );
}

export default function VastuChecker(props: Props) {
  return (
    <IslandBoundary locale={props.locale}>
      <Vastu {...props} />
    </IslandBoundary>
  );
}
