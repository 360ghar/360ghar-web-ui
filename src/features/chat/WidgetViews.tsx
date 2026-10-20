import { compactPrice, formatDate, formatNum, imageUrl, rupees } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { chatCopy, humanize, valueLabel, type ChatCopy } from './copy';
import {
  normalizeWidget,
  type NormalizedWidget,
  type StatKey,
  type WidgetLease,
  type WidgetProperty,
  type WidgetVisit,
} from './widgets';
import type { Widget } from './store';

/** Most rows drawn in one bubble. */
const MAX_ROWS = 5;

type Ctx = { locale: Locale; c: ChatCopy };

const homeHref = (id: number, locale: Locale) => localizePath(`/property/${id}`, locale);

/** A date-only value has no time and no zone shift; a timestamp shows the time too. */
function when(value: string | null, { locale }: Ctx, withTime = false): string | null {
  if (!value) return null;
  const dateOnly = value.length <= 10;
  return formatDate(value, locale, {
    day: 'numeric',
    month: 'short',
    ...(dateOnly ? { year: 'numeric', timeZone: 'UTC' } : withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

const label = (map: Record<string, string>, key: string | null) => (key ? (Object.hasOwn(map, key) ? map[key] : humanize(key)) : null);

function price(p: WidgetProperty, { locale, c }: Ctx): string {
  const amount = p.purpose === 'rent' ? (p.monthlyRent ?? p.basePrice) : p.basePrice;
  if (!amount) return c.priceOnRequest;
  return p.purpose === 'rent' ? `${rupees(amount, locale)}${c.perMonth}` : compactPrice(amount, locale);
}

const facts = (p: WidgetProperty, { c, locale }: Ctx) =>
  [
    p.bedrooms ? `${formatNum(p.bedrooms, locale)} BHK` : null,
    p.bathrooms ? `${formatNum(p.bathrooms, locale)} ${c.bath}` : null,
    p.areaSqft ? `${formatNum(p.areaSqft, locale)} ${c.sqft}` : null,
  ].filter(Boolean);

const place = (p: { locality: string | null; city: string | null }) => [p.locality, p.city].filter(Boolean).join(', ');

function Thumb({ src }: { src: string | null }) {
  return src ? <img src={imageUrl(src, 160)} alt="" width={64} height={48} loading="lazy" /> : <span className="chat-results-ph" />;
}

function PropertyRows({ items, ctx }: { items: WidgetProperty[]; ctx: Ctx }) {
  return (
    <ul className="chat-results">
      {items.slice(0, MAX_ROWS).map((p) => (
        <li key={p.id}>
          <a href={homeHref(p.id, ctx.locale)}>
            <Thumb src={p.image} />
            <span className="grid">
              <strong className="tabular">{price(p, ctx)}</strong>
              <span className="truncate">{[...facts(p, ctx).slice(0, 1), place(p)].filter(Boolean).join(' · ') || p.title}</span>
              {p.tenantName ? <span className="truncate chat-muted">{ctx.c.tenant(p.tenantName)}</span> : null}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Title({ children }: { children: string | null }) {
  return children ? <h3 className="chat-widget-title">{children}</h3> : null;
}

function Empty({ children }: { children: string }) {
  return <p className="chat-muted">{children}</p>;
}

function Visits({ items, ctx }: { items: WidgetVisit[]; ctx: Ctx }) {
  const { c } = ctx;
  if (!items.length) return <Empty>{c.noVisits}</Empty>;
  return (
    <>
      <Title>{c.visits}</Title>
      <ul className="chat-rows">
        {items.slice(0, MAX_ROWS).map((v, i) => {
          const name = v.title ?? place({ locality: v.place, city: null }) ?? '';
          return (
            <li key={v.id ?? i}>
              <span className="grid">
                {v.propertyId ? (
                  <a className="link" href={homeHref(v.propertyId, ctx.locale)}>
                    {name || `#${v.propertyId}`}
                  </a>
                ) : (
                  <strong>{name}</strong>
                )}
                {when(v.date, ctx, true) ? <span className="tabular">{when(v.date, ctx, true)}</span> : null}
              </span>
              {v.status ? <span className="chat-state">{label(c.visitStatus, v.status)}</span> : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}

const STAT_LABEL: Record<StatKey, keyof ChatCopy> = {
  properties: 'statProperties',
  occupied: 'statOccupied',
  vacant: 'statVacant',
  income: 'statIncome',
  leases: 'statLeases',
  maintenance: 'statMaintenance',
  visits: 'statVisits',
};

function Lease({ l, ctx }: { l: WidgetLease; ctx: Ctx }) {
  const { c, locale } = ctx;
  const period = [when(l.start, ctx), when(l.end, ctx)].filter(Boolean).join(' - ');
  const extra = [
    l.deposit ? `${c.leaseDeposit}: ${rupees(l.deposit, locale)}` : null,
    l.dueDay ? c.leaseDueDay(l.dueDay) : null,
  ].filter(Boolean);
  return (
    <li>
      <span className="grid">
        {l.propertyId ? (
          <a className="link" href={homeHref(l.propertyId, locale)}>
            {l.title ?? `#${l.propertyId}`}
          </a>
        ) : (
          <strong>{l.title ?? c.lease}</strong>
        )}
        {l.rent ? <span className="tabular">{`${rupees(l.rent, locale)}${c.perMonth}`}</span> : null}
        {period ? <span className="tabular chat-muted">{period}</span> : null}
        {l.tenant ? <span className="chat-muted">{`${c.leaseTenant}: ${l.tenant}`}</span> : null}
        {extra.length ? <span className="chat-muted tabular">{extra.join(' · ')}</span> : null}
      </span>
      {l.status ? <span className="chat-state">{valueLabel(c, l.status)}</span> : null}
    </li>
  );
}

function Body({ w, ctx }: { w: NormalizedWidget; ctx: Ctx }) {
  const { c, locale } = ctx;
  switch (w.kind) {
    case 'properties':
      return w.items.length ? (
        <>
          <PropertyRows items={w.items} ctx={ctx} />
          {(w.total ?? 0) > Math.min(w.items.length, MAX_ROWS) ? <p className="chat-muted">{c.showing(Math.min(w.items.length, MAX_ROWS), w.total ?? 0)}</p> : null}
        </>
      ) : (
        <Empty>{c.noHomes}</Empty>
      );
    case 'property': {
      const p = w.item;
      const line = [
        p.furnished ? `${c.furnished}: ${humanize(p.furnished)}` : null,
        p.floor !== null ? c.floor(p.floor, p.totalFloors) : null,
      ].filter(Boolean);
      return (
        <div className="chat-home">
          {p.image ? <img src={imageUrl(p.image, 480)} alt="" width={320} height={200} loading="lazy" /> : null}
          <strong className="font-display tabular chat-home-price">{price(p, ctx)}</strong>
          <a className="link" href={homeHref(p.id, locale)}>
            {p.title ?? c.viewHome}
          </a>
          {place(p) || p.address ? <span className="chat-muted">{p.address ?? place(p)}</span> : null}
          {facts(p, ctx).length ? <span className="tabular">{facts(p, ctx).join(' · ')}</span> : null}
          {line.length ? <span className="chat-muted">{line.join(' · ')}</span> : null}
          {p.amenities.length ? <span className="chat-muted">{`${c.amenities}: ${p.amenities.join(', ')}`}</span> : null}
        </div>
      );
    }
    case 'visits':
      return <Visits items={w.items} ctx={ctx} />;
    case 'dashboard':
      return (
        <>
          <Title>{c.dashboard}</Title>
          {w.stats.length ? (
            <dl className="chat-stats">
              {w.stats.map((s) => (
                <div key={s.key}>
                  <dt>{c[STAT_LABEL[s.key]] as string}</dt>
                  <dd className="font-display tabular">{s.key === 'income' ? compactPrice(s.value, locale) : formatNum(s.value, locale)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {w.items.length ? <PropertyRows items={w.items} ctx={ctx} /> : null}
        </>
      );
    case 'leases':
      return w.items.length ? (
        <>
          <Title>{w.items.length === 1 ? c.lease : c.leases}</Title>
          {w.activeLeases !== null || w.totalRent !== null ? (
            <p className="chat-muted tabular">
              {[
                w.activeLeases !== null ? `${c.activeLeases}: ${formatNum(w.activeLeases, locale)}` : null,
                w.totalRent !== null ? `${c.totalRent}: ${rupees(w.totalRent, locale)}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}
          <ul className="chat-rows">
            {w.items.slice(0, MAX_ROWS).map((l, i) => (
              <Lease key={l.id ?? i} l={l} ctx={ctx} />
            ))}
          </ul>
        </>
      ) : (
        <Empty>{c.noLeases}</Empty>
      );
    case 'maintenance':
      return w.items.length ? (
        <>
          <Title>{c.maintenance}</Title>
          <ul className="chat-rows">
            {w.items.slice(0, MAX_ROWS).map((m, i) => (
              <li key={m.id ?? i}>
                <span className="grid">
                  <strong>{m.title ?? c.request}</strong>
                  <span className="chat-muted tabular">
                    {[valueLabel(c, m.category), valueLabel(c, m.priority), when(m.date, ctx)].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {m.status ? <span className="chat-state">{valueLabel(c, m.status)}</span> : null}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Empty>{c.noMaintenance}</Empty>
      );
    case 'rent': {
      const { due, paid, overdue } = w.totals;
      const head = [
        due !== null ? `${c.rentDue}: ${rupees(due, locale)}` : null,
        paid !== null ? `${c.rentPaid}: ${rupees(paid, locale)}` : null,
        overdue !== null ? `${c.rentOverdue}: ${formatNum(overdue, locale)}` : null,
      ].filter(Boolean);
      if (!w.charges.length && !w.payments.length && !head.length) return <Empty>{c.noRent}</Empty>;
      return (
        <>
          <Title>{c.rent}</Title>
          {head.length ? <p className="chat-muted tabular">{head.join(' · ')}</p> : null}
          {w.charges.length ? (
            <ul className="chat-rows">
              {w.charges.slice(0, MAX_ROWS).map((ch, i) => (
                <li key={ch.id ?? i}>
                  <span className="grid">
                    <strong className="tabular">{ch.amountDue !== null ? rupees(ch.amountDue, locale) : (when(ch.month, ctx) ?? c.rent)}</strong>
                    <span className="chat-muted tabular">
                      {[
                        ch.due ? `${c.dueOn} ${when(ch.due, ctx)}` : null,
                        ch.amountPaid !== null ? `${c.rentPaid}: ${rupees(ch.amountPaid, locale)}` : null,
                        ch.balance ? `${c.rentBalance}: ${rupees(ch.balance, locale)}` : null,
                        ch.lateFee ? `${c.rentLate}: ${rupees(ch.lateFee, locale)}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  {ch.status ? <span className="chat-state">{valueLabel(c, ch.status)}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {w.payments.length ? (
            <>
              <Title>{c.payments}</Title>
              <ul className="chat-rows">
                {w.payments.slice(0, MAX_ROWS).map((p, i) => (
                  <li key={p.id ?? i}>
                    <span className="grid">
                      <strong className="tabular">{p.amount !== null ? rupees(p.amount, locale) : c.notAvailable}</strong>
                      <span className="chat-muted tabular">{[when(p.date, ctx) ? `${c.paidOn} ${when(p.date, ctx)}` : null, valueLabel(c, p.method)].filter(Boolean).join(' · ')}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      );
    }
    case 'notice':
      return <p>{w.message}</p>;
    case 'generic':
      return (
        <>
          <Title>{w.title ?? c.resultTitle}</Title>
          {w.rows.length ? (
            <dl className="chat-kv">
              {w.rows.map((r, i) => (
                <div key={i}>
                  {r.key ? <dt>{r.key}</dt> : null}
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <Empty>{c.resultReceived}</Empty>
          )}
        </>
      );
  }
}

/** One widget in a bot bubble. The payload is normalized first; a bad payload draws as a key/value list. */
export function WidgetView({ widget, locale }: { widget: Widget; locale: Locale }) {
  const ctx: Ctx = { locale, c: chatCopy(locale) };
  return (
    <div className="chat-widget">
      <Body w={normalizeWidget(widget.name, widget.data)} ctx={ctx} />
    </div>
  );
}
