import type { ReactNode } from 'react';
import { Icon } from '@/ui/icons/Icon';
import { PaperScene } from './PaperScene';
import type { SceneName } from './scenes';

type Action = { label: string; href?: string; onClick?: () => void };

type Props = {
  scene: SceneName;
  title: string;
  body?: ReactNode;
  action?: Action;
  secondary?: Action;
  /** Smaller art and padding, for use inside a panel or list. */
  compact?: boolean;
  children?: ReactNode;
};

function ActionButton({ action, primary }: { action: Action; primary: boolean }) {
  const className = primary ? 'btn btn-primary' : 'link';
  const icon = primary ? <Icon name={action.onClick ? 'retry' : 'arrow-up-right'} size={18} className="arrow" /> : null;
  if (action.href) {
    return (
      <a className={className} href={action.href}>
        {action.label}
        {icon}
      </a>
    );
  }
  return (
    <button type="button" className={primary ? className : `${className} bg-transparent border-0 cursor-pointer p-0`} onClick={action.onClick}>
      {action.label}
      {icon}
    </button>
  );
}

/** Empty, error, not-found and offline states inside islands. */
export function StateBlock({ scene, title, body, action, secondary, compact, children }: Props) {
  return (
    <section
      role={scene === 'error' || scene === 'offline' ? 'alert' : undefined}
      className={`grid justify-items-center text-center mx-auto max-w-[34rem] ${compact ? 'gap-3 px-4 py-6' : 'gap-5 px-4 py-8'}`}
    >
      <div className={compact ? 'w-[min(100%,12rem)]' : 'w-[min(100%,18rem)]'}>
        <PaperScene name={scene} />
      </div>
      <div>
        <h2 className="font-display text-[1.375rem] md:text-[1.75rem]">{title}</h2>
        {body ? <p className="mt-2 text-ink-600">{body}</p> : null}
        {children}
        {action || secondary ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            {action ? <ActionButton action={action} primary /> : null}
            {secondary ? <ActionButton action={secondary} primary={false} /> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
