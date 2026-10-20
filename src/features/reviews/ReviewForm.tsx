/**
 * Review capture (v1 ReviewCapture). The backend has no reviews route (GET
 * /api/v1/reviews and /api/reviews both return 404), so it posts to the contact
 * Formspree form with `source=review`. Nothing is shown as a public review.
 * Reusable: `<ReviewForm client:visible locale s={reviewStrings(locale)} propertyId? />`.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { applyFieldErrors } from '@/lib/api/errors';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { SelectField, TextAreaField, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { toast } from '@/ui/react/Toaster';
import { FORMSPREE, sendFormspree } from '@/features/content/shared/formspree';
import { shared } from '@/features/content/shared/text';
import { isSpam, reviewPayload, reviewSchema, type ReviewValues } from './schema';
import type { ReviewStrings } from './strings';

type Props = { locale: Locale; s: ReviewStrings; /** Prefix for the field ids when a page has more than one form. */ id?: string; propertyId?: number | null };

function Form({ locale, s, id = 'rev', propertyId }: Props) {
  const x = shared(locale);
  const schema = useMemo(() => reviewSchema(s.err), [s.err]);
  const [sent, setSent] = useState(false);
  const [fail, setFail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    reset,
    control,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({ resolver: zodResolver(schema), defaultValues: { text: '', name: '', role: '', website: '' } });
  const rating = Number(useWatch({ control, name: 'rating' }) ?? 0);

  const done = () => {
    reset();
    setSent(true);
    toast(s.sentTitle, 'success');
  };

  const onSubmit = handleSubmit(
    async (values) => {
      setFail(null);
      if (isSpam(values)) return done();
      const r = await sendFormspree(FORMSPREE.contact, reviewPayload(values, propertyId));
      if (r.ok) return done();
      if (!applyFieldErrors(r, { setError, getValues }).length) setFail(`${x.notSent} ${r.network ? x.network : r.message} ${x.tryAgain}`.replace(/\s+/g, ' '));
    },
    (errs) => {
      const first = Object.keys(errs)[0] as keyof ReviewValues | undefined;
      if (first && first !== 'website' && first !== 'rating') setFocus(first);
    },
  );

  if (sent) {
    return (
      <div className="rev-sent" role="status">
        <Icon name="check" size={28} />
        <p className="rev-sent-title">{s.sentTitle}</p>
        <p>{s.sentBody}</p>
        <button type="button" className="btn btn-quiet" onClick={() => setSent(false)}>
          {s.again}
        </button>
      </div>
    );
  }

  return (
    <form className="rev-form" onSubmit={onSubmit} noValidate aria-describedby={fail ? `${id}-fail` : undefined}>
      <fieldset className="rev-rating" aria-describedby={errors.rating ? `${id}-rating-error` : undefined}>
        <legend className="field-label">{s.rating}</legend>
        <div className="rev-stars">
          {s.labels.map((label, i) => (
            <label key={label} className={`rev-star${i < rating ? ' is-on' : ''}`}>
              <input type="radio" value={String(i + 1)} className="visually-hidden" aria-label={`${i + 1}, ${label}`} {...register('rating')} />
              <Icon name="star" size={28} />
            </label>
          ))}
          <span className="rev-rating-text" aria-hidden="true">
            {rating ? s.labels[rating - 1] : ''}
          </span>
        </div>
        {errors.rating ? (
          <p id={`${id}-rating-error`} className="field-error">
            <Icon name="alert" size={16} />
            {errors.rating.message}
          </p>
        ) : null}
      </fieldset>
      <SelectField id={`${id}-role`} label={s.role} optional={s.optional} {...register('role')}>
        <option value="">{s.rolePick}</option>
        {s.roles.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>
      <TextField id={`${id}-name`} label={s.name} optional={s.optional} autoComplete="name" error={errors.name?.message} {...register('name')} />
      <div className="rev-text">
        <TextAreaField id={`${id}-text`} label={s.text} optional={s.textHint} rows={4} error={errors.text?.message} {...register('text')} />
      </div>
      {/* Honeypot: off screen, out of the tab order and hidden from screen readers. */}
      <div className="rev-trap" aria-hidden="true">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>
      {fail ? (
        <p id={`${id}-fail`} className="field-error rev-fail" role="alert">
          <Icon name="alert" size={16} />
          {fail}
        </p>
      ) : null}
      <button type="submit" className="btn btn-ink btn-lg rev-submit" disabled={isSubmitting}>
        {isSubmitting ? x.sending : s.submit}
        {isSubmitting ? null : <Icon name="arrow-up-right" size={18} className="arrow" />}
      </button>
    </form>
  );
}

export default function ReviewForm(props: Props) {
  return (
    <IslandBoundary locale={props.locale} compact>
      <Form {...props} />
    </IslandBoundary>
  );
}
