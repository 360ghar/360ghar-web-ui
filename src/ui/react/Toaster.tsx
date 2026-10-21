import { useEffect } from 'react';
import { create } from 'zustand';
import { Icon } from '@/ui/icons/Icon';

type Tone = 'info' | 'success' | 'error';
type Toast = { id: number; tone: Tone; text: string; action?: { label: string; run: () => void } };

type ToastStore = {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
};

let next = 1;

/** Module singleton: any island can call `toast(...)`; one Toaster renders them. */
const useToasts = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id: next++ }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = (text: string, tone: Tone = 'info', action?: Toast['action']) =>
  useToasts.getState().push(action ? { text, tone, action } : { text, tone });

function Item({ t }: { t: Toast }) {
  const dismiss = useToasts((s) => s.dismiss);
  useEffect(() => {
    const id = window.setTimeout(() => dismiss(t.id), t.action ? 8000 : 5000);
    return () => window.clearTimeout(id);
  }, [t, dismiss]);
  const icon = t.tone === 'error' ? 'alert' : t.tone === 'success' ? 'check' : 'info';
  return (
    <li className={`toast toast-${t.tone}`}>
      <Icon name={icon} size={18} />
      <span className="grow">{t.text}</span>
      {t.action ? (
        <button
          type="button"
          className="toast-action"
          onClick={() => {
            t.action?.run();
            dismiss(t.id);
          }}
        >
          {t.action.label}
        </button>
      ) : null}
      <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
        <Icon name="close" size={16} />
      </button>
    </li>
  );
}

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <ol className="toaster" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <Item key={t.id} t={t} />
      ))}
    </ol>
  );
}
