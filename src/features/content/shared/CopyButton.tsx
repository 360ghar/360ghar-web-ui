import { useState } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { copyText } from '@/ui/react/share';

type Props = { locale: Locale; text: string; label: string; done: string; primary?: boolean };

function Button({ text, label, done, primary }: Props) {
  const [state, setState] = useState<'idle' | 'done'>('idle');
  return (
    <>
      <button
        type="button"
        className={primary ? 'btn btn-primary' : 'btn btn-ink'}
        onClick={async () => {
          if (await copyText(text)) {
            setState('done');
            window.setTimeout(() => setState('idle'), 2500);
          }
        }}
      >
        <Icon name={state === 'done' ? 'check' : 'copy'} size={18} />
        {state === 'done' ? done : label}
      </button>
      <span className="visually-hidden" role="status">
        {state === 'done' ? done : ''}
      </span>
    </>
  );
}

export default function CopyButton(props: Props) {
  return (
    <IslandBoundary locale={props.locale} compact>
      <Button {...props} />
    </IslandBoundary>
  );
}
