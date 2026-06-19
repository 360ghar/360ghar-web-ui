import { useEffect } from 'react';

/**
 * AUDIT FIX (imp 5.5): traps keyboard focus inside a modal/drawer while it is
 * active. Pass a ref to the container element and a boolean `active` flag.
 * While active, Tab/Shift+Tab cycle through the container's focusable
 * descendants and focus is moved into the container on activation. When the
 * trap deactivates, focus is returned to the previously-focused element.
 *
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {boolean} active - whether the trap should be engaged
 */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement;

    // Move focus into the container on activation.
    const focusables = () =>
      Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    const initialFocusables = focusables();
    if (initialFocusables.length > 0) {
      initialFocusables[0].focus();
    } else {
      container.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the trigger element when the trap deactivates.
      try {
        if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
          previouslyFocused.focus();
        }
      } catch {
        // element may have been unmounted during SPA navigation
      }
    };
  }, [active, containerRef]);
}

export default useFocusTrap;
