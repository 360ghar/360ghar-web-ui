/**
 * Owner AI controls in the post-property wizard (flagged, see lib/flags):
 *  - ListingWriter: drafts a title and description from the details and the photos. The draft is editable and
 *    goes into the form only when the owner presses "Use this text".
 *  - StageControl: makes a "Virtually staged" copy of one photo, and puts the original back on request.
 */
import { useState } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { TextAreaField, TextField } from '@/ui/react/Field';
import { listingDraft, MAX_DRAFT_PHOTOS, stagePhoto, type Failure } from './ai';
import './owner-ai.css';

const T = {
  en: {
    write: 'Write it with AI',
    writing: 'Writing',
    lead: 'Drafts a title and description from your details and photos. Check every fact, then use it or write your own.',
    draftTitle: 'Suggested title',
    draftBody: 'Suggested description',
    use: 'Use this text',
    discard: 'Discard',
    needPhotos: 'Add photos in the Photos step to use this.',
    rate: 'Too many requests. Try again in a minute.',
    unavailable: 'The writer is not available right now.',
    failed: 'We could not write this now. Try again in a minute.',
    stage: 'Virtually stage',
    staging: 'Staging',
    original: 'Show original',
    label: 'Virtually staged',
    stageNote: 'The staged copy is marked "Virtually staged" on the image itself, so buyers know the furniture is not there.',
    stageUnavailable: 'Virtual staging is not available right now.',
    stageFailed: 'We could not stage this photo now. Try again in a minute.',
    stageRate: 'Staging is limited per minute. Try again shortly.',
  },
  hi: {
    write: 'AI से लिखवाएँ',
    writing: 'लिख रहा है',
    lead: 'आपकी जानकारी और फ़ोटो से शीर्षक और विवरण का ड्राफ़्ट बनाता है। हर बात जाँचें, फिर इस्तेमाल करें या अपना लिखें।',
    draftTitle: 'सुझाया गया शीर्षक',
    draftBody: 'सुझाया गया विवरण',
    use: 'यह टेक्स्ट इस्तेमाल करें',
    discard: 'छोड़ें',
    needPhotos: 'इसके लिए फ़ोटो वाले चरण में फ़ोटो जोड़ें।',
    rate: 'बहुत ज़्यादा अनुरोध। एक मिनट बाद कोशिश करें।',
    unavailable: 'अभी लिखने की सुविधा उपलब्ध नहीं है।',
    failed: 'अभी नहीं लिख सके। एक मिनट बाद कोशिश करें।',
    stage: 'वर्चुअल स्टेज करें',
    staging: 'स्टेज हो रहा है',
    original: 'असली फ़ोटो दिखाएँ',
    label: 'वर्चुअली स्टेज्ड',
    stageNote: 'स्टेज की गई कॉपी की इमेज पर ही "Virtually staged" लिखा होता है, ताकि खरीदार जानें कि फ़र्नीचर असल में नहीं है।',
    stageUnavailable: 'अभी वर्चुअल स्टेजिंग उपलब्ध नहीं है।',
    stageFailed: 'अभी यह फ़ोटो स्टेज नहीं हो सकी। एक मिनट बाद कोशिश करें।',
    stageRate: 'स्टेजिंग प्रति मिनट सीमित है। थोड़ी देर बाद कोशिश करें।',
  },
};

const failText = (t: (typeof T)['en'], f: Failure, stage = false) =>
  f === 'rate' ? (stage ? t.stageRate : t.rate) : f === 'unavailable' ? (stage ? t.stageUnavailable : t.unavailable) : stage ? t.stageFailed : t.failed;

type WriterProps = {
  locale: Locale;
  images: string[];
  details: Record<string, unknown>;
  /** Puts the accepted text in the form. */
  onUse: (text: { title: string; description: string }) => void;
};

export function ListingWriter({ locale, images, details, onUse }: WriterProps) {
  const t = T[locale];
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<{ title: string; description: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    const r = await listingDraft(images.slice(0, MAX_DRAFT_PHOTOS), details);
    setBusy(false);
    if ('failure' in r) setError(failText(t, r.failure));
    else setDraft(r);
  };

  return (
    <div className="oai-writer">
      <p className="field-hint">{images.length ? t.lead : t.needPhotos}</p>
      {/* While a draft is open the button is hidden, so a new one never replaces text the owner edited. */}
      {draft ? null : (
        <button type="button" className="btn btn-quiet justify-self-start -ml-3" onClick={() => void run()} disabled={busy || images.length === 0}>
          <Icon name="edit" size={18} />
          {busy ? t.writing : t.write}
        </button>
      )}
      {error ? (
        <p className="field-error" role="alert">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
      {draft ? (
        <div className="oai-draft">
          <TextField label={t.draftTitle} maxLength={200} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <TextAreaField label={t.draftBody} rows={6} maxLength={5000} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          <div className="oai-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onUse(draft);
                setDraft(null);
              }}
            >
              {t.use}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setDraft(null)}>
              {t.discard}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type StageProps = {
  locale: Locale;
  url: string;
  /** Staged photo url -> its original url. */
  staged: Record<string, string>;
  setStaged: (update: (prev: Record<string, string>) => Record<string, string>) => void;
  /** Swaps one photo for another in the listing. */
  replace: (from: string, to: string) => void;
};

export function StageControl({ locale, url, staged, setStaged, replace }: StageProps) {
  const t = T[locale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const original = staged[url];

  const toggle = async () => {
    setError(null);
    if (original) {
      replace(url, original);
      setStaged(({ [url]: _gone, ...rest }) => rest);
      return;
    }
    setBusy(true);
    const r = await stagePhoto(url);
    setBusy(false);
    if ('failure' in r) return setError(failText(t, r.failure, true));
    replace(url, r.url);
    setStaged((prev) => ({ ...prev, [r.url]: url }));
  };

  return (
    <div className="oai-stage">
      {original ? <span className="oai-staged">{t.label}</span> : null}
      <button type="button" className="btn btn-quiet" onClick={() => void toggle()} disabled={busy}>
        {busy ? t.staging : original ? t.original : t.stage}
      </button>
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export const stageNote = (locale: Locale) => T[locale].stageNote;
