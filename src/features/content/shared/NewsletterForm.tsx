import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Locale } from '@/lib/i18n/locale';
import { EMAIL_RE } from '@/lib/phone';
import { Icon } from '@/ui/icons/Icon';
import { TextField } from '@/ui/react/Field';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { FORMSPREE, sendFormspree } from './formspree';
import { shared } from './text';

type Props = { locale: Locale; done: string };

function Newsletter({ locale, done }: Props) {
  const s = shared(locale);
  const schema = z.object({ email: z.string().trim().min(1, s.emailRequired).regex(EMAIL_RE, s.emailInvalid) });
  const [sent, setSent] = useState(false);
  const [fail, setFail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFail(null);
    const r = await sendFormspree(FORMSPREE.newsletter, { email });
    if (r.ok) return setSent(true);
    if (r.fields.email) setError('email', { message: r.fields.email });
    else setFail(`${s.notSent} ${r.network ? s.network : r.message} ${s.tryAgain}`.replace(/\s+/g, ' '));
  });

  if (sent) {
    return (
      <p className="news-done" role="status">
        <Icon name="check" size={20} />
        {done}
      </p>
    );
  }

  return (
    <form className="news-form" onSubmit={onSubmit} noValidate>
      <TextField
        label={s.newsletterEmail}
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <button type="submit" className="btn btn-ink" disabled={isSubmitting}>
        {isSubmitting ? s.sending : s.newsletterButton}
      </button>
      {fail ? (
        <p className="field-error news-fail" role="alert">
          <Icon name="alert" size={16} />
          {fail}
        </p>
      ) : null}
    </form>
  );
}

export default function NewsletterForm(props: Props) {
  return (
    <IslandBoundary locale={props.locale} compact>
      <Newsletter {...props} />
    </IslandBoundary>
  );
}
