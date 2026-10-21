import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyFieldErrors } from '@/lib/api/errors';
import type { Locale } from '@/lib/i18n/locale';
import { EMAIL_RE } from '@/lib/phone';
import { Icon } from '@/ui/icons/Icon';
import { TextAreaField, TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { FORMSPREE, sendFormspree } from '@/features/content/shared/formspree';
import { shared } from '@/features/content/shared/text';

/** Labels and messages, resolved on the server from the old translations. */
export type ContactStrings = {
  name: string;
  nameRequired: string;
  email: string;
  emailRequired: string;
  emailInvalid: string;
  subject: string;
  message: string;
  messageShort: string;
  optional: string;
  send: string;
  sentTitle: string;
  sentBody: string;
  again: string;
};

type Props = { locale: Locale; s: ContactStrings; id?: string };

function Form({ locale, s, id = 'contact' }: Props) {
  const x = shared(locale);
  const schema = z.object({
    user_name: z.string().trim().min(1, s.nameRequired),
    user_email: z.string().trim().min(1, s.emailRequired).regex(EMAIL_RE, s.emailInvalid),
    user_subject: z.string().trim(),
    message: z.string().trim().min(5, s.messageShort),
  });
  type Values = z.infer<typeof schema>;
  const [sent, setSent] = useState(false);
  const [fail, setFail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { user_name: '', user_email: '', user_subject: '', message: '' } });

  // ?subject= prefills the subject (read after hydration; the page is static).
  useEffect(() => {
    const subject = new URLSearchParams(window.location.search).get('subject');
    if (subject) setValue('user_subject', subject.slice(0, 200));
  }, [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setFail(null);
    const r = await sendFormspree(FORMSPREE.contact, values);
    if (r.ok) {
      reset();
      setSent(true);
      return;
    }
    if (!applyFieldErrors(r, { setError, getValues }).length) setFail(`${x.notSent} ${r.network ? x.network : r.message} ${x.tryAgain}`.replace(/\s+/g, ' '));
  });

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
    <form className="contact-form" onSubmit={onSubmit} noValidate aria-describedby={fail ? `${id}-fail` : undefined}>
      <div className="contact-row">
        <TextField id={`${id}-name`} label={s.name} autoComplete="name" error={errors.user_name?.message} {...register('user_name')} />
        <TextField
          id={`${id}-email`}
          label={s.email}
          type="email"
          inputMode="email"
          autoComplete="email"
          error={errors.user_email?.message}
          {...register('user_email')}
        />
      </div>
      <TextField id={`${id}-subject`} label={s.subject} optional={s.optional} error={errors.user_subject?.message} {...register('user_subject')} />
      <TextAreaField id={`${id}-message`} label={s.message} rows={5} error={errors.message?.message} {...register('message')} />
      {fail ? (
        <p id={`${id}-fail`} className="field-error" role="alert">
          <Icon name="alert" size={16} />
          {fail}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
        {isSubmitting ? x.sending : s.send}
        {isSubmitting ? null : <Icon name="arrow-up-right" size={18} className="arrow" />}
      </button>
    </form>
  );
}

export default function ContactForm(props: Props) {
  return (
    <IslandBoundary locale={props.locale} compact>
      <Form {...props} />
    </IslandBoundary>
  );
}
