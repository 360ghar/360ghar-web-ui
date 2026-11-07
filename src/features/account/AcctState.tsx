import type { ReactNode } from 'react';
import type { AccountVignetteName } from '@/lib/paper/accountVignettes';
import { Icon } from '@/ui/icons/Icon';
import { AccountVignette } from '@/ui/paper/AccountArt';

type Action = { label: string; href?: string; onClick?: () => void };

/** Empty state with an account vignette. Same shape as the shared StateBlock. */
export function AcctState({ name, title, body, action, secondary, children }: { name: AccountVignetteName; title: string; body?: ReactNode; action?: Action; secondary?: Action; children?: ReactNode }) {
  const btn = (a: Action, primary: boolean) => {
    const cls = primary ? 'btn btn-primary' : 'link';
    const icon = primary ? <Icon name={a.onClick ? 'retry' : 'arrow-up-right'} size={18} className="arrow" /> : null;
    return a.href ? (
      <a className={cls} href={a.href}>
        {a.label}
        {icon}
      </a>
    ) : (
      <button type="button" className={primary ? cls : `${cls} cursor-pointer border-0 bg-transparent p-0`} onClick={a.onClick}>
        {a.label}
        {icon}
      </button>
    );
  };
  return (
    <section className="mx-auto grid max-w-[34rem] justify-items-center gap-4 px-4 py-6 text-center">
      <div className="w-[min(100%,15rem)]">
        <AccountVignette name={name} />
      </div>
      <div>
        <h2 className="font-display text-[1.375rem] md:text-[1.625rem]">{title}</h2>
        {body ? <p className="mt-2 text-ink-600">{body}</p> : null}
        {children}
        {action || secondary ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            {action ? btn(action, true) : null}
            {secondary ? btn(secondary, false) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
