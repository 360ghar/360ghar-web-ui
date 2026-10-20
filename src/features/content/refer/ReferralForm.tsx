/**
 * Referral form. Same fields as the old ReferralForm. The backend has no
 * referral endpoint, so it posts to Formspree mwpqglyb with form_type=referral.
 * Success shows only after Formspree confirms (the old form faked success).
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Locale } from '@/lib/i18n/locale';
import { EMAIL_RE, normalizeMobile } from '@/lib/phone';
import { Icon } from '@/ui/icons/Icon';
import { Check, SelectField, TextAreaField, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { FORMSPREE, sendFormspree } from '@/features/content/shared/formspree';
import { shared } from '@/features/content/shared/text';

export type ReferralStrings = {
  you: string;
  property: string;
  name: string;
  phone: string;
  phoneHint: string;
  email: string;
  relationship: string;
  pick: string;
  relationships: [string, string][];
  ownerName: string;
  ownerPhone: string;
  address: string;
  addressHint: string;
  type: string;
  types: [string, string][];
  intent: string;
  intents: [string, string][];
  price: string;
  notes: string;
  notesHint: string;
  optional: string;
  consent: string;
  terms: string;
  termsLink: string;
  submit: string;
  sentTitle: string;
  sentBody: string;
  again: string;
  err: { name: string; phone: string; email: string; relationship: string; ownerName: string; ownerPhone: string; address: string; type: string; intent: string; consent: string; terms: string; price: string };
};

type Props = { locale: Locale; s: ReferralStrings };

function Form({ locale, s }: Props) {
  const x = shared(locale);
  const mobile = (msg: string) => z.string().refine((v) => normalizeMobile(v) !== '', msg);
  const schema = z.object({
    referrer_name: z.string().trim().min(1, s.err.name),
    referrer_phone: mobile(s.err.phone),
    referrer_email: z.string().trim().regex(EMAIL_RE, s.err.email),
    relationship: z.string().min(1, s.err.relationship),
    owner_name: z.string().trim().min(1, s.err.ownerName),
    owner_phone: mobile(s.err.ownerPhone),
    address: z.string().trim().min(1, s.err.address),
    property_type: z.string().min(1, s.err.type),
    intent: z.string().min(1, s.err.intent),
    expected_price: z.string().trim().regex(/^\d{0,12}$/, s.err.price),
    additional_notes: z.string().trim(),
    consent: z.literal(true, { message: s.err.consent }),
    terms_accepted: z.literal(true, { message: s.err.terms }),
  });
  type Values = z.infer<typeof schema>;
  const [sent, setSent] = useState(false);
  const [fail, setFail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      referrer_name: '',
      referrer_phone: '',
      referrer_email: '',
      relationship: '',
      owner_name: '',
      owner_phone: '',
      address: '',
      property_type: '',
      intent: '',
      expected_price: '',
      additional_notes: '',
    },
  });

  const onSubmit = handleSubmit(
    async (v) => {
      setFail(null);
      const r = await sendFormspree(FORMSPREE.contact, {
        form_type: 'referral',
        _subject: `Property referral: ${v.property_type} for ${v.intent}`,
        ...v,
        referrer_phone: normalizeMobile(v.referrer_phone),
        owner_phone: normalizeMobile(v.owner_phone),
        consent: 'yes',
        terms_accepted: 'yes',
      });
      if (r.ok) {
        reset();
        setSent(true);
        return;
      }
      setFail(`${x.notSent} ${r.network ? x.network : r.message || Object.values(r.fields).join(' ')} ${x.tryAgain}`.replace(/\s+/g, ' '));
    },
    (errs) => {
      const first = Object.keys(errs)[0] as keyof Values | undefined;
      if (first) setFocus(first);
    },
  );

  if (sent) {
    return (
      <div className="contact-sent" role="status">
        <Icon name="check" size={28} />
        <p className="contact-sent-title">{s.sentTitle}</p>
        <p>{s.sentBody}</p>
        <button type="button" className="btn btn-quiet" onClick={() => setSent(false)}>
          {s.again}
        </button>
      </div>
    );
  }

  return (
    <form className="ref-form" onSubmit={onSubmit} noValidate>
      <fieldset>
        <legend>{s.you}</legend>
        <div className="ref-grid">
          <TextField id="ref-name" label={s.name} autoComplete="name" error={errors.referrer_name?.message} {...register('referrer_name')} />
          <TextField id="ref-phone" label={s.phone} type="tel" inputMode="tel" autoComplete="tel" hint={s.phoneHint} error={errors.referrer_phone?.message} {...register('referrer_phone')} />
          <TextField id="ref-email" label={s.email} type="email" inputMode="email" autoComplete="email" error={errors.referrer_email?.message} {...register('referrer_email')} />
          <SelectField id="ref-rel" label={s.relationship} error={errors.relationship?.message} {...register('relationship')}>
            <option value="">{s.pick}</option>
            {s.relationships.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </SelectField>
        </div>
      </fieldset>

      <fieldset>
        <legend>{s.property}</legend>
        <div className="ref-grid">
          <TextField id="ref-owner" label={s.ownerName} error={errors.owner_name?.message} {...register('owner_name')} />
          <TextField id="ref-owner-phone" label={s.ownerPhone} type="tel" inputMode="tel" error={errors.owner_phone?.message} {...register('owner_phone')} />
          <div className="ref-wide">
            <TextAreaField id="ref-address" label={s.address} rows={3} hint={s.addressHint} error={errors.address?.message} {...register('address')} />
          </div>
          <SelectField id="ref-type" label={s.type} error={errors.property_type?.message} {...register('property_type')}>
            <option value="">{s.pick}</option>
            {s.types.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </SelectField>
          <SelectField id="ref-intent" label={s.intent} error={errors.intent?.message} {...register('intent')}>
            <option value="">{s.pick}</option>
            {s.intents.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </SelectField>
          <TextField id="ref-price" label={s.price} optional={s.optional} inputMode="numeric" error={errors.expected_price?.message} {...register('expected_price')} />
          <div className="ref-wide">
            <TextAreaField id="ref-notes" label={s.notes} optional={s.optional} rows={2} hint={s.notesHint} {...register('additional_notes')} />
          </div>
        </div>
      </fieldset>

      <div className="ref-checks">
        <div>
          <Check label={s.consent} aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? 'ref-consent-error' : undefined} {...register('consent')} />
          {errors.consent ? (
            <p id="ref-consent-error" className="field-error">
              <Icon name="alert" size={16} />
              {errors.consent.message}
            </p>
          ) : null}
        </div>
        <div>
          <Check
            label={
              <>
                {s.terms} <a href="#terms">{s.termsLink}</a>
              </>
            }
            aria-invalid={errors.terms_accepted ? true : undefined}
            aria-describedby={errors.terms_accepted ? 'ref-terms-error' : undefined}
            {...register('terms_accepted')}
          />
          {errors.terms_accepted ? (
            <p id="ref-terms-error" className="field-error">
              <Icon name="alert" size={16} />
              {errors.terms_accepted.message}
            </p>
          ) : null}
        </div>
      </div>

      {fail ? (
        <p className="field-error" role="alert">
          <Icon name="alert" size={16} />
          {fail}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
        {isSubmitting ? x.sending : s.submit}
        {isSubmitting ? null : <Icon name="arrow-up-right" size={18} className="arrow" />}
      </button>
    </form>
  );
}

export default function ReferralForm(props: Props) {
  return (
    <IslandBoundary locale={props.locale} compact>
      <Form {...props} />
    </IslandBoundary>
  );
}
