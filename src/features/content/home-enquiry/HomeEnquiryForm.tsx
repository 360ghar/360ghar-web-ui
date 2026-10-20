/**
 * Owner enquiry on the home page (v1 MessageThree). The backend has no lead
 * route for owners, so it posts to the contact Formspree form with
 * `source=home-enquiry`. "Sent" shows only after Formspree confirms.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { applyFieldErrors } from '@/lib/api/errors';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { Check, TextAreaField, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { toast } from '@/ui/react/Toaster';
import { FORMSPREE, sendFormspree } from '@/features/content/shared/formspree';
import { shared } from '@/features/content/shared/text';
import { enquiryPayload, enquirySchema, isSpam, type EnquiryValues } from './schema';
import type { EnquiryStrings } from './strings';

type Props = { locale: Locale; s: EnquiryStrings };

function Form({ locale, s }: Props) {
  const x = shared(locale);
  const schema = useMemo(() => enquirySchema(s.err), [s.err]);
  const [sent, setSent] = useState(false);
  const [fail, setFail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryValues>({ resolver: zodResolver(schema), defaultValues: { full_name: '', email: '', address: '', message: '', website: '' } });

  const done = () => {
    reset();
    setSent(true);
    toast(s.sentTitle, 'success');
  };

  const onSubmit = handleSubmit(
    async (values) => {
      setFail(null);
      // A bot filled the hidden field: look sent, post nothing.
      if (isSpam(values)) return done();
      const r = await sendFormspree(FORMSPREE.contact, enquiryPayload(values));
      if (r.ok) return done();
      if (!applyFieldErrors(r, { setError, getValues }).length) setFail(`${x.notSent} ${r.network ? x.network : r.message} ${x.tryAgain}`.replace(/\s+/g, ' '));
    },
    (errs) => {
      const first = Object.keys(errs)[0] as keyof EnquiryValues | undefined;
      if (first && first !== 'website') setFocus(first);
    },
  );

  if (sent) {
    return (
      <div className="enq-sent" role="status">
        <Icon name="check" size={28} />
        <p className="enq-sent-title">{s.sentTitle}</p>
        <p>{s.sentBody}</p>
        <button type="button" className="btn btn-quiet" onClick={() => setSent(false)}>
          {s.again}
        </button>
      </div>
    );
  }

  return (
    <form className="enq-form" onSubmit={onSubmit} noValidate aria-describedby={fail ? 'enq-fail' : undefined}>
      <div className="enq-row">
        <TextField id="enq-name" label={s.name} autoComplete="name" error={errors.full_name?.message} {...register('full_name')} />
        <TextField id="enq-email" label={s.emailLabel} type="email" inputMode="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      </div>
      <TextField id="enq-address" label={s.address} autoComplete="street-address" hint={s.addressHint} error={errors.address?.message} {...register('address')} />
      <TextAreaField id="enq-notes" label={s.notes} optional={s.optional} rows={3} error={errors.message?.message} {...register('message')} />
      {/* Honeypot: off screen, out of the tab order and hidden from screen readers. */}
      <div className="enq-trap" aria-hidden="true">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>
      <div>
        <Check
          label={
            <>
              {s.agreePre}{' '}
              <a href={s.termsHref} target="_blank" rel="noopener">
                {s.terms}
                <span className="visually-hidden"> {s.newTab}</span>
              </a>{' '}
              {s.and}{' '}
              <a href={s.privacyHref} target="_blank" rel="noopener">
                {s.privacy}
                <span className="visually-hidden"> {s.newTab}</span>
              </a>
              {s.agreePost}
            </>
          }
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? 'enq-consent-error' : undefined}
          {...register('consent')}
        />
        {errors.consent ? (
          <p id="enq-consent-error" className="field-error">
            <Icon name="alert" size={16} />
            {errors.consent.message}
          </p>
        ) : null}
      </div>
      {fail ? (
        <p id="enq-fail" className="field-error" role="alert">
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

export default function HomeEnquiryForm(props: Props) {
  return (
    <IslandBoundary locale={props.locale} compact>
      <Form {...props} />
    </IslandBoundary>
  );
}
