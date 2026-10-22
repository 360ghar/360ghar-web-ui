/**
 * Owner AI controls in the post-property wizard (flagged, see lib/flags):
 *  - ListingWriter: drafts a title and description from the details and the photos. The draft is editable and
 *    goes into the form only when the owner presses "Use this text".
 *  - StageControl: makes a "Virtually staged" copy of one photo, and puts the original back on request.
 */
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { SelectField, TextAreaField, TextField } from '@/ui/react/Field';
import { listingDraft, MAX_DRAFT_PHOTOS, STAGE_ROOMS, STAGE_STYLES, stagePhoto, type Failure, type FlagCode, type ListingDraft, type StageRoom, type StageStyle } from './ai';
import './owner-ai.css';

const T = {
  en: {
    write: 'Write it with AI',
    writing: 'Writing. This can take a minute or two.',
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
    staging: 'Staging. This can take a minute or two.',
    stageRun: 'Stage this photo',
    stageCancel: 'Cancel',
    room: 'Room',
    style: 'Style',
    rooms: { living_room: 'Living room', bedroom: 'Bedroom', dining_room: 'Dining room', kitchen: 'Kitchen', study: 'Study', balcony: 'Balcony' },
    styles: { modern: 'Modern', minimalist: 'Minimalist', scandinavian: 'Scandinavian', traditional_indian: 'Traditional Indian', contemporary: 'Contemporary' },
    original: 'Show original',
    label: 'Virtually staged',
    flagsTitle: 'Check these photos',
    photoN: (n: number) => `Photo ${n}`,
    flags: {
      blurry: 'is blurred.',
      dark: 'is too dark.',
      people_visible: 'shows people.',
      text_or_watermark: 'has text or a watermark.',
      not_a_property: 'does not look like a property.',
      duplicate_photo: 'is a duplicate.',
      low_resolution: 'is small and low in quality.',
    } as Partial<Record<FlagCode, string>>,
    flagsSet: { few_photos: 'Add more photos.', no_exterior_or_entrance: 'Add a photo of the outside or the entrance.' } as Partial<Record<FlagCode, string>>,
    stageNote: 'The staged copy is marked "Virtually staged" on the image itself, so buyers know the furniture is not there.',
    stageUnavailable: 'Virtual staging is not available right now.',
    stageFailed: 'We could not stage this photo now. Try again in a minute.',
    stageRate: 'Staging is limited per minute. Try again shortly.',
  },
  hi: {
    write: 'AI से लिखवाएँ',
    writing: 'लिख रहा है। इसमें एक-दो मिनट लग सकते हैं।',
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
    staging: 'स्टेज हो रहा है। इसमें एक-दो मिनट लग सकते हैं।',
    stageRun: 'यह फ़ोटो स्टेज करें',
    stageCancel: 'रद्द करें',
    room: 'कमरा',
    style: 'शैली',
    rooms: { living_room: 'लिविंग रूम', bedroom: 'बेडरूम', dining_room: 'डाइनिंग रूम', kitchen: 'किचन', study: 'स्टडी', balcony: 'बालकनी' },
    styles: { modern: 'मॉडर्न', minimalist: 'मिनिमलिस्ट', scandinavian: 'स्कैंडिनेवियन', traditional_indian: 'पारंपरिक भारतीय', contemporary: 'कंटेंपररी' },
    original: 'असली फ़ोटो दिखाएँ',
    label: 'वर्चुअली स्टेज्ड',
    flagsTitle: 'इन फ़ोटो को जाँचें',
    photoN: (n: number) => `फ़ोटो ${n}`,
    flags: {
      blurry: 'धुंधली है।',
      dark: 'बहुत अंधेरी है।',
      people_visible: 'में लोग दिखते हैं।',
      text_or_watermark: 'पर टेक्स्ट या वॉटरमार्क है।',
      not_a_property: 'प्रॉपर्टी जैसी नहीं दिखती।',
      duplicate_photo: 'दोहराई गई है।',
      low_resolution: 'छोटी है और क्वालिटी कम है।',
    } as Partial<Record<FlagCode, string>>,
    flagsSet: { few_photos: 'और फ़ोटो जोड़ें।', no_exterior_or_entrance: 'बाहर या एंट्रेंस की फ़ोटो जोड़ें।' } as Partial<Record<FlagCode, string>>,
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
  /** The open draft lives in the wizard, so going back to fix a photo does not lose the owner's edits. */
  draft: ListingDraft | null;
  setDraft: (draft: ListingDraft | null) => void;
  /** Puts the accepted text in the form. */
  onUse: (text: { title: string; description: string }) => void;
};

export function ListingWriter({ locale, images, details, draft, setDraft, onUse }: WriterProps) {
  const t = T[locale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The reply can take minutes. If the owner left the step meanwhile, it is dropped: its photo flags may point at moved photos.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const run = async () => {
    setBusy(true);
    setError(null);
    const r = await listingDraft(images.slice(0, MAX_DRAFT_PHOTOS), details);
    if (!alive.current) return;
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
          {t.write}
        </button>
      )}
      <p className="field-hint" role="status">
        {busy ? t.writing : ''}
      </p>
      {error ? (
        <p className="field-error" role="alert">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
      {draft ? (
        <div className="oai-draft">
          {draft.flags.length ? (
            <div className="oai-flags">
              <p className="oai-flags-title">{t.flagsTitle}</p>
              <ul>
                {draft.flags.map((f, i) => {
                  // English shows the model's own note; Hindi shows a fixed line for the code.
                  const note = locale === 'en' && f.note ? f.note : null;
                  const fixed = f.photo === null ? t.flagsSet[f.code] : t.flags[f.code];
                  const text = note ?? fixed;
                  if (!text) return null;
                  const lead = f.photo === null ? '' : `${t.photoN(f.photo + 1)}${note ? ': ' : ' '}`;
                  return <li key={i}>{lead + text}</li>;
                })}
              </ul>
            </div>
          ) : null}
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
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState<StageRoom>('living_room');
  const [style, setStyle] = useState<StageStyle>('modern');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const original = staged[url];

  const restore = () => {
    if (!original) return;
    setError(null);
    replace(url, original);
    setStaged(({ [url]: _gone, ...rest }) => rest);
  };

  const run = async () => {
    setError(null);
    setBusy(true);
    const r = await stagePhoto(url, room, style);
    setBusy(false);
    if ('failure' in r) return setError(failText(t, r.failure, true));
    replace(url, r.url);
    setStaged((prev) => ({ ...prev, [r.url]: url }));
    setOpen(false);
  };

  return (
    <div className="oai-stage">
      {original ? <span className="oai-staged">{t.label}</span> : null}
      {original ? (
        <button type="button" className="btn btn-quiet" onClick={restore}>
          {t.original}
        </button>
      ) : open ? (
        <div className="oai-stage-form">
          <SelectField label={t.room} value={room} onChange={(e) => setRoom(e.target.value as StageRoom)} disabled={busy}>
            {STAGE_ROOMS.map((r) => (
              <option key={r} value={r}>
                {t.rooms[r]}
              </option>
            ))}
          </SelectField>
          <SelectField label={t.style} value={style} onChange={(e) => setStyle(e.target.value as StageStyle)} disabled={busy}>
            {STAGE_STYLES.map((x) => (
              <option key={x} value={x}>
                {t.styles[x]}
              </option>
            ))}
          </SelectField>
          <div className="oai-actions">
            <button type="button" className="btn btn-primary" onClick={() => void run()} disabled={busy}>
              {busy ? t.staging : t.stageRun}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setOpen(false)} disabled={busy}>
              {t.stageCancel}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-quiet" onClick={() => setOpen(true)}>
          {t.stage}
        </button>
      )}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export const stageNote = (locale: Locale) => T[locale].stageNote;
