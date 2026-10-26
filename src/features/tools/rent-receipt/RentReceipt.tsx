import { memo, useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { SelectField, TextAreaField, TextField } from '@/ui/react/Field';
import { toast } from '@/ui/react/Toaster';
import { useIsClient } from '@/ui/react/useClient';
import { fyLabel } from '../capital-gains/math';
import { inr, ScrollArea, ToolShell } from '../ui';
import { RR_UI } from './content';
import { batch, formatDate, fyStart, monthPeriod, MODES, PAN_RE, receiptBase, rupeesInWords, todayIso, type Mode } from './receipt';
import './rent-receipt.css';

type Form = { landlord: string; pan: string; tenant: string; address: string; rent: string; from: string; to: string; mode: Mode; ref: string; date: string };

const EMPTY: Form = { landlord: '', pan: '', tenant: '', address: '', rent: '', from: '', to: '', mode: 'upi', ref: '', date: '' };
const SAMPLE = {
  landlord: 'Sunita Gupta',
  pan: 'ABCPG1234F',
  tenant: 'Rahul Sharma',
  address: 'Flat 402, Tower B, DLF Phase 1, Gurugram, Haryana 122002',
  rent: '25000',
  mode: 'upi' as Mode,
  ref: 'UPI 412345678901',
};

/** Current month and today. Only called in the browser (the page is prerendered). */
function fresh(): Form {
  const now = new Date();
  const p = monthPeriod(now.getFullYear(), now.getMonth() + 1);
  return { ...EMPTY, from: p.start, to: p.end, date: todayIso(now) };
}

type Receipt = Omit<Form, 'rent'> & { rent: number; number: string; sig: string };

const BLANK = '________________';

function PaperView({ r, locale }: { r: Receipt; locale: Locale }) {
  const t = RR_UI[locale];
  const words = locale === 'en' ? rupeesInWords(r.rent) : '';
  return (
    <article className="rr-paper" lang={locale} aria-label={`${t.receiptAria} ${r.number}`}>
      <header className="rr-head">
        <h3 className="rr-title">{t.paperTitle}</h3>
        <p className="rr-meta">
          <span>
            {t.receiptNoLabel} <strong>{r.number || '…'}</strong>
          </span>
          <span>
            {t.dateLabel} <strong>{formatDate(r.date, locale) || BLANK}</strong>
          </span>
        </p>
      </header>
      {locale === 'hi' ? (
        <p className="rr-body">
          {t.received} <strong>{r.rent > 0 ? inr(r.rent, locale) : '₹______'}</strong>। {t.fromLabel}: <strong>{r.tenant || BLANK}</strong>। {t.propertyLabel}: <strong>{r.address || BLANK}</strong>। {t.periodLabel}:{' '}
          <strong>{formatDate(r.from, locale) || BLANK}</strong> {t.periodFrom} <strong>{formatDate(r.to, locale) || BLANK}</strong> {t.periodTo}।
        </p>
      ) : (
        <p className="rr-body">
          {t.received} <strong>{r.rent > 0 ? inr(r.rent, locale) : '₹______'}</strong>
          {words ? ` (${words})` : ''} {t.fromLabel} <strong>{r.tenant || BLANK}</strong> {t.propertyLabel}{' '}
          <strong>{r.address || BLANK}</strong> {t.periodLabel} {t.periodFrom} <strong>{formatDate(r.from, locale) || BLANK}</strong> {t.periodTo}{' '}
          <strong>{formatDate(r.to, locale) || BLANK}</strong>.
        </p>
      )}
      <dl className="rr-lines">
        <div>
          <dt>{t.modeLabel}</dt>
          <dd>{t.modes[r.mode]}</dd>
        </div>
        {r.ref && r.mode !== 'cash' ? (
          <div>
            <dt>{r.mode === 'cheque' ? t.chequeNoLabel : t.transactionRefLabel}</dt>
            <dd>{r.ref}</dd>
          </div>
        ) : null}
        <div>
          <dt>{t.landlordLabel}</dt>
          <dd>{r.landlord || BLANK}</dd>
        </div>
        {r.pan ? (
          <div>
            <dt>{t.panLabel}</dt>
            <dd>{r.pan}</dd>
          </div>
        ) : null}
      </dl>
      <footer className="rr-foot">
        <div className="rr-sign">
          {r.sig ? <img src={r.sig} alt="Landlord signature" className="rr-sign-img" /> : null}
          <span className="rr-sign-line" />
          {t.signatureLabel}
        </div>
      </footer>
    </article>
  );
}

// r is rebuilt on every keystroke: compare its fields, so a paper only draws when its own text changes.
const Paper = memo(PaperView, (a, b) => a.locale === b.locale && (Object.keys(a.r) as (keyof Receipt)[]).every((k) => a.r[k] === b.r[k]));

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rr-fieldset">
      <legend className="rr-legend">{title}</legend>
      {children}
    </fieldset>
  );
}

function RentReceiptForm({ locale }: { locale: Locale }) {
  const t = RR_UI[locale];
  const isClient = useIsClient();
  const [f, setF] = useState<Form>(EMPTY);
  const [number, setNumber] = useState('');
  // The financial year comes from the device clock: 0 until hydration is done. The picked year overrides it.
  const fyNow = isClient ? fyStart() : 0;
  const [fyPick, setFyPick] = useState<number | null>(null);
  const fy = fyPick ?? fyNow;
  const [sig, setSig] = useState('');
  const [yearMode, setYearMode] = useState(false);
  const [tried, setTried] = useState(false);

  // Dates and the receipt number depend on the device clock, so they are set after hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setF(fresh());
    setNumber(receiptBase());
  }, []);

  const set = (patch: Partial<Form>) => setF((v) => ({ ...v, ...patch }));
  const rent = Number(f.rent) || 0;
  const errors = {
    landlord: f.landlord.trim() ? '' : t.required,
    tenant: f.tenant.trim() ? '' : t.required,
    address: f.address.trim() ? '' : t.required,
    rent: rent > 0 ? '' : t.rentRequired,
    to: !yearMode && f.from && f.to && f.to < f.from ? t.periodError : '',
    pan: f.pan && !PAN_RE.test(f.pan) ? t.panInvalid : '',
  };
  const show = (k: keyof typeof errors) => (tried || k === 'to' || (k === 'pan' && f.pan.length >= 10) ? errors[k] || undefined : undefined);

  const common = { ...f, rent, sig };
  const receipts: Receipt[] = yearMode
    ? batch(number, fy).map((b) => ({ ...common, number: b.number, from: b.start, to: b.end, date: b.date }))
    : [{ ...common, number }];

  const print = () => {
    if (Object.values(errors).some(Boolean)) {
      setTried(true);
      toast(t.fix, 'error');
      return;
    }
    window.print();
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return toast(t.notImage, 'error');
    if (file.size > 2 * 1024 * 1024) return toast(t.tooLarge, 'error');
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' && setSig(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="tool-split">
        <section className="tool-sheet" aria-label={t.receiptSec}>
          <Section title={t.landlordSec}>
            <TextField label={t.landlordName} placeholder={t.landlordPh} autoComplete="off" value={f.landlord} error={show('landlord')} onChange={(e) => set({ landlord: e.target.value })} />
            <TextField
              label={t.pan}
              optional={t.optional}
              placeholder="ABCDE1234F"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={10}
              hint={t.panHint}
              value={f.pan}
              error={show('pan')}
              onChange={(e) => set({ pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
            />
            <div className="field">
              <span className="field-label">
                {t.signature} <span className="font-normal text-ink-600">{t.optional}</span>
              </span>
              {sig ? (
                <div className="rr-sig-row">
                  <img src={sig} alt={t.signature} className="rr-sig-thumb" />
                  <button type="button" className="btn btn-quiet" onClick={() => setSig('')}>
                    <Icon name="trash" size={18} />
                    {t.removeSig}
                  </button>
                </div>
              ) : null}
              <label className="btn rr-upload">
                <Icon name="upload" size={18} />
                {sig ? t.change : t.upload}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="visually-hidden" aria-describedby="rr-sig-hint" onChange={onFile} />
              </label>
              <p id="rr-sig-hint" className="field-hint">
                {t.signatureHint}
              </p>
            </div>
          </Section>

          <Section title={t.tenantSec}>
            <TextField label={t.tenantName} placeholder={t.tenantPh} autoComplete="name" value={f.tenant} error={show('tenant')} onChange={(e) => set({ tenant: e.target.value })} />
          </Section>

          <Section title={t.propertySec}>
            <TextAreaField label={t.address} placeholder={t.addressPh} rows={2} value={f.address} error={show('address')} onChange={(e) => set({ address: e.target.value })} />
            <TextField
              label={t.rent}
              inputMode="numeric"
              placeholder="25000"
              autoComplete="off"
              value={f.rent}
              error={show('rent')}
              hint={rent > 0 ? t.yearly(inr(rent * 12, locale)) : undefined}
              onChange={(e) => set({ rent: e.target.value.replace(/\D/g, '').slice(0, 9) })}
            />
            {yearMode ? null : (
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <TextField label={t.from} type="date" value={f.from} onChange={(e) => set({ from: e.target.value })} />
                <TextField label={t.to} type="date" value={f.to} min={f.from || undefined} error={show('to')} onChange={(e) => set({ to: e.target.value })} />
              </div>
            )}
            <SelectField label={t.mode} value={f.mode} onChange={(e) => set({ mode: e.target.value as Mode })}>
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {t.modes[m]}
                </option>
              ))}
            </SelectField>
            {f.mode === 'cash' ? null : (
              <TextField
                label={f.mode === 'cheque' ? t.chequeNo : t.txnRef}
                optional={t.optional}
                placeholder={f.mode === 'cheque' ? t.chequePh : t.txnPh}
                autoComplete="off"
                value={f.ref}
                onChange={(e) => set({ ref: e.target.value })}
              />
            )}
          </Section>

          <Section title={t.receiptSec}>
            {yearMode ? (
              <SelectField label={t.fy} value={fy} onChange={(e) => setFyPick(Number(e.target.value))}>
                {[fyNow - 1, fyNow].map((y) => (
                  <option key={y} value={y}>
                    {fyLabel(y)}
                  </option>
                ))}
              </SelectField>
            ) : (
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <TextField label={t.date} type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} />
                <TextField label={t.number} value={number} readOnly />
              </div>
            )}
          </Section>
        </section>

        <div className="tool-stack rr-side">
          <section className="tool-sheet" aria-labelledby="rr-preview">
            <div>
              <h2 id="rr-preview" className="tool-sheet-title">
                {yearMode ? t.previewYear(fyLabel(fy)) : t.preview}
              </h2>
              <p className="tool-note mt-1">
                {t.private} {t.englishNote}
              </p>
            </div>
            {yearMode ? (
              <ScrollArea label={t.previewYear(fyLabel(fy))} tall>
                <div className="rr-batch">
                  {receipts.map((r) => (
                    <Paper key={r.number} r={r} locale={locale} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Paper r={receipts[0]!} locale={locale} />
            )}
            <div className="tool-actions">
              <button type="button" className="btn btn-primary" onClick={print}>
                <Icon name="print" size={18} />
                {yearMode ? t.printYear : t.print}
              </button>
              <button type="button" className="btn" onClick={() => setYearMode((v) => !v)}>
                <Icon name={yearMode ? 'arrow-left' : 'calendar'} size={18} />
                {yearMode ? t.single : t.fullYear}
              </button>
            </div>
            <div className="tool-actions">
              <button type="button" className="btn btn-quiet" onClick={() => set(SAMPLE)}>
                <Icon name="edit" size={18} />
                {t.sample}
              </button>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => {
                  setF(fresh());
                  setSig('');
                  setYearMode(false);
                  setTried(false);
                  setFyPick(null);
                }}
              >
                <Icon name="trash" size={18} />
                {t.clear}
              </button>
            </div>
          </section>
        </div>
      </div>
      {isClient
        ? createPortal(
            <div className="rr-print" aria-hidden="true">
              {receipts.map((r) => (
                <Paper key={r.number} r={r} locale={locale} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export default function RentReceipt({ locale }: { locale: Locale }) {
  return (
    <ToolShell locale={locale}>
      <RentReceiptForm locale={locale} />
    </ToolShell>
  );
}
