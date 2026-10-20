import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { toast } from '@/ui/react/Toaster';
import { copyText } from '@/ui/react/share';
import { ToolShell } from '../ui';
import { CHECKLIST_UI } from './content';
import { useStored, write } from './store';
import { fileSize, progress, summaryText, type Files, type Group, type Ticks } from './summary';
import './checklist.css';

const TICKS = 'propertyChecklist';
const FILES = 'propertyChecklistDocs';

type Props = { locale: Locale; groups: Group[] };

function List({ locale, groups }: Props) {
  const t = CHECKLIST_UI[locale];
  const ticks = useStored<Ticks>(TICKS);
  const files = useStored<Files>(FILES);
  const p = progress(groups, ticks);

  const setFile = (id: number, file: File | undefined) => {
    if (!file) return;
    write<Files>(FILES, { ...files, [id]: { name: file.name, size: file.size, uploadedAt: new Date().toISOString() } });
    toast(t.fileNoted(file.name), 'success');
  };
  const removeFile = (id: number) => {
    const next = { ...files };
    delete next[id];
    write<Files>(FILES, next);
  };
  const copy = async () => {
    const ok = await copyText(summaryText(t.summaryTitle, groups, ticks, files, t.progressLine(p.done, p.total)));
    toast(ok ? t.copied : t.copyFailed, ok ? 'success' : 'error');
  };
  const clear = () => {
    const before = ticks;
    write<Ticks>(TICKS, {});
    toast(t.cleared, 'info', { label: t.undo, run: () => write<Ticks>(TICKS, before) });
  };

  return (
    <>
      <div className="checklist-layout">
        <aside className="tool-result checklist-side" aria-labelledby="checklist-progress">
          <div>
            <h2 id="checklist-progress" className="tool-result-label">
              {t.progress}
            </h2>
            <p className="tool-figure" data-testid="checklist-count">
              {t.of(p.done, p.total)}
            </p>
            <p className="tool-result-sub">{t.papers}</p>
          </div>
          <div
            className="tool-bar"
            role="progressbar"
            aria-labelledby="checklist-progress"
            aria-valuemin={0}
            aria-valuemax={p.total}
            aria-valuenow={p.done}
            aria-valuetext={t.of(p.done, p.total)}
          >
            <span className="tool-bar-a" style={{ width: `${p.pct}%` }} />
          </div>
          <div className="checklist-actions tool-noprint">
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
              <Icon name="print" size={18} />
              {t.print}
            </button>
            <button type="button" className="btn btn-quiet" onClick={copy}>
              <Icon name="copy" size={18} />
              {t.copy}
            </button>
            {p.done > 0 ? (
              <button type="button" className="btn btn-quiet" onClick={clear}>
                <Icon name="retry" size={18} />
                {t.clear}
              </button>
            ) : null}
          </div>
          <p className="tool-result-sub tool-noprint">{t.saved}</p>
        </aside>

        <div className="checklist-main">
          {groups.map((g, gi) => (
            <section key={g.title} className="tool-sheet checklist-group" aria-labelledby={`cl-g${gi}`}>
              <h2 id={`cl-g${gi}`} className="tool-sheet-title">
                {g.title}
              </h2>
              <ul className="checklist-items">
                {g.items.map((d) => {
                  const f = files[d.id];
                  return (
                    <li key={d.id} className="checklist-item" data-done={ticks[d.id] ? '' : undefined}>
                      <label className="checklist-check">
                        <span className="check">
                          <input
                            type="checkbox"
                            checked={Boolean(ticks[d.id])}
                            onChange={(e) => write<Ticks>(TICKS, { ...ticks, [d.id]: e.target.checked })}
                            aria-describedby={`cl-d${d.id}`}
                          />
                        </span>
                        <span className="checklist-name">{d.text}</span>
                      </label>
                      <p id={`cl-d${d.id}`} className="checklist-desc">
                        {d.desc}
                      </p>
                      <div className="checklist-file">
                        {f ? (
                          <>
                            <span className="checklist-filename">
                              <Icon name="upload" size={16} />
                              {f.name} <span className="text-ink-600">({fileSize(f.size)})</span>
                            </span>
                            <button type="button" className="btn btn-quiet tool-noprint" aria-label={t.removeFile(f.name)} onClick={() => removeFile(d.id)}>
                              <Icon name="close" size={16} />
                              {t.remove}
                            </button>
                          </>
                        ) : (
                          <label className="btn btn-quiet checklist-add tool-noprint" title={t.fileHint}>
                            <Icon name="upload" size={16} />
                            {t.addFile}
                            <span className="visually-hidden">: {d.text}</span>
                            <input type="file" accept="image/*,.pdf" className="visually-hidden" onChange={(e) => setFile(d.id, e.target.files?.[0])} />
                          </label>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <p className="tool-note tool-noprint">{t.fileHint}</p>
        </div>
      </div>
    </>
  );
}

export default function Checklist(props: Props) {
  return (
    <ToolShell locale={props.locale} className="tool-print-area">
      <List {...props} />
    </ToolShell>
  );
}
