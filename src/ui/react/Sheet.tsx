import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from '@/ui/icons/Icon';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Sticky footer, e.g. "Show 24 homes". */
  footer?: ReactNode;
  /** "sheet" docks to the bottom on phones and becomes a side panel from 768 px. */
  variant?: 'sheet' | 'dialog';
  closeLabel?: string;
};

/**
 * Bottom sheet and dialog on the native <dialog> element: focus trap, Esc to
 * close, inert background and top layer come from the browser.
 */
export function Sheet({ open, onClose, title, children, footer, variant = 'sheet', closeLabel = 'Close' }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      document.documentElement.style.overflow = 'hidden';
    }
    if (!open && el.open) el.close();
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  return (
    // The backdrop click is a mouse shortcut; Esc (native) and the close button cover keyboards.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`sheet-dialog ${variant === 'sheet' ? 'is-sheet' : 'is-dialog'}`}
      onClose={() => {
        document.documentElement.style.overflow = '';
        onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet-panel">
        <header className="sheet-head">
          {variant === 'sheet' ? <span className="sheet-grip" aria-hidden="true" /> : null}
          <h2 id={titleId} className="font-display text-xl">
            {title}
          </h2>
          <button type="button" className="btn btn-quiet btn-icon" onClick={onClose} aria-label={closeLabel}>
            <Icon name="close" />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer ? <footer className="sheet-foot">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
