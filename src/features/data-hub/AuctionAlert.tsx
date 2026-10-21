/**
 * "Set an alert" button and form. POST /data-hub/auctions/alerts needs a
 * session, so a signed-out user goes to /login?next=<this page> first.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { initAuth, useAuthStore } from '@/features/auth/store';
import { api, call } from '@/lib/api/client';
import { ApiError, applyFieldErrors, describeError } from '@/lib/api/errors';
import { AUCTION_PROPERTY_TYPES } from '@/lib/api/enums';
import { parseNumber } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { loginHref } from '@/features/auth/flows';
import { Icon } from '@/ui/icons/Icon';
import { SelectField, TextField } from '@/ui/react/Field';
import { Sheet } from '@/ui/react/Sheet';
import { toast, Toaster } from '@/ui/react/Toaster';
import { Island } from './Island';
import { label, text } from './text';

type AlertDefaults = { bank_name?: string | null; city?: string | null; property_type?: (typeof AUCTION_PROPERTY_TYPES)[number] | null; min_price?: number | null; max_price?: number | null };

const toLogin = (locale: Locale) => window.location.assign(loginHref(locale));

const money = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^[\d,]+$/.test(v) && (parseNumber(v) ?? 0) > 0));

const buildSchema = (t: ReturnType<typeof text>) =>
  z
    .object({ bank_name: z.string().max(200), city: z.string().max(100), keyword: z.string().trim().max(100), property_type: z.union([z.literal(''), z.enum(AUCTION_PROPERTY_TYPES)]), min_price: money, max_price: money })
    .refine((v) => !v.min_price || !v.max_price || (parseNumber(v.max_price) ?? 0) > (parseNumber(v.min_price) ?? 0), { path: ['max_price'], message: t.alertRange });
type Values = z.infer<ReturnType<typeof buildSchema>>;

export function AuctionAlert({ locale, banks, cities = [], defaults = {}, className = 'btn' }: { locale: Locale; banks: string[]; cities?: string[]; defaults?: AlertDefaults; className?: string }) {
  const t = text(locale);
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  const schema = useMemo(() => buildSchema(text(locale)), [locale]);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      bank_name: defaults.bank_name ?? '',
      city: defaults.city ?? '',
      keyword: '',
      property_type: defaults.property_type ?? '',
      min_price: defaults.min_price ? String(defaults.min_price) : '',
      max_price: defaults.max_price ? String(defaults.max_price) : '',
    },
  });

  const save = useMutation({
    mutationFn: (v: Values) => {
      return call(
        api.POST('/api/v1/data-hub/auctions/alerts', {
          body: {
            bank_name: v.bank_name || null,
            city: v.city || null,
            keyword: v.keyword || null,
            property_type: v.property_type || null,
            min_price: parseNumber(v.min_price),
            max_price: parseNumber(v.max_price),
          },
        }),
      );
    },
    onSuccess: () => {
      setOpen(false);
      toast(t.alertSaved, 'success');
    },
    onError: (e) => {
      if (e instanceof ApiError && e.kind === 'unauthorized') toLogin(locale);
      // A 422 names the fields: show each message under its field.
      applyFieldErrors(e, form);
    },
  });

  const start = async () => {
    setChecking(true);
    await initAuth();
    setChecking(false);
    if (useAuthStore.getState().status !== 'authed') toLogin(locale);
    else setOpen(true);
  };

  const err = save.isError ? describeError(save.error, locale) : null;
  const bankOptions = defaults.bank_name && !banks.includes(defaults.bank_name) ? [defaults.bank_name, ...banks] : banks;
  const cityOptions = defaults.city && !cities.includes(defaults.city) ? [defaults.city, ...cities] : cities;

  return (
    <>
      <button type="button" className={className} onClick={() => void start()} disabled={checking} aria-haspopup="dialog">
        <Icon name="clock" size={18} />
        {t.alert}
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t.alertTitle}
        closeLabel={t.close}
        variant="dialog"
        footer={
          <button type="submit" form="dh-alert-form" className="btn btn-primary grow" disabled={save.isPending}>
            {save.isPending ? t.alertSaving : t.alertSave}
          </button>
        }
      >
        <form id="dh-alert-form" className="dh-form" noValidate onSubmit={form.handleSubmit((v) => save.mutate(v))}>
          <p className="text-ink-800">{t.alertLead}</p>
          <SelectField label={t.alertBank} {...form.register('bank_name')}>
            <option value="">{t.alertAny}</option>
            {bankOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </SelectField>
          {cityOptions.length ? (
            <SelectField label={t.alertCity} {...form.register('city')}>
              <option value="">{t.alertAny}</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
          ) : null}
          <TextField label={t.alertKeyword} hint={t.alertKeywordHint} autoComplete="off" maxLength={100} {...form.register('keyword')} />
          <SelectField label={t.alertType} {...form.register('property_type')}>
            <option value="">{t.alertAny}</option>
            {AUCTION_PROPERTY_TYPES.map((p) => (
              <option key={p} value={p}>
                {label(t.types, p)}
              </option>
            ))}
          </SelectField>
          <div className="dh-form-row">
            <TextField label={t.alertMin} inputMode="numeric" autoComplete="off" error={form.formState.errors.min_price ? t.sdValueError : undefined} {...form.register('min_price')} />
            <TextField label={t.alertMax} inputMode="numeric" autoComplete="off" error={form.formState.errors.max_price?.message || (form.formState.errors.max_price ? t.sdValueError : undefined)} {...form.register('max_price')} />
          </div>
          {err ? (
            <p className="field-error" role="alert">
              <Icon name="alert" size={16} />
              {err.title}. {err.body}
            </p>
          ) : null}
        </form>
      </Sheet>
    </>
  );
}

/** Stand-alone island for pages without another island (auction detail). */
export default function AuctionAlertIsland(props: Parameters<typeof AuctionAlert>[0]) {
  return (
    <Island locale={props.locale} compact>
      <AuctionAlert {...props} />
      <Toaster />
    </Island>
  );
}
