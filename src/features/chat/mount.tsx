import { createRoot, type Root } from 'react-dom/client';
import type { Locale } from '@/lib/i18n/locale';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import ChatPanel from './ChatPanel';
import { useChat } from './store';

let root: Root | null = null;

/** Mounts the chat panel on first open. The launcher button is plain HTML. */
export function openChat(host: HTMLElement, locale: Locale, strings: Record<string, unknown>, launcher: HTMLElement) {
  useChat.getState().setOpen(true);
  host.hidden = false;
  launcher.setAttribute('aria-expanded', 'true');
  const close = () => {
    useChat.getState().setOpen(false);
    host.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  };
  // Escape anywhere in the panel closes it; focus goes back to the button.
  host.onkeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  root ??= createRoot(host);
  root.render(
    <IslandBoundary locale={locale} compact>
      <ChatPanel locale={locale} strings={strings} onClose={close} />
    </IslandBoundary>,
  );
  // Each open moves focus into the panel (the first open also does this in ChatPanel).
  // The history view has no textarea, so it takes the heading (or the first button while it loads).
  requestAnimationFrame(() => (host.querySelector<HTMLElement>('textarea') ?? host.querySelector<HTMLElement>('#chat-hist-title, button'))?.focus());
}
