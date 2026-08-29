/**
 * Keyboard helpers: Cmd/Ctrl+K detection and focus trapping for modal chrome.
 */

export interface KeyboardEventLike {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
}

/** True for Cmd+K (macOS) or Ctrl+K (Windows/Linux); browsers reserve both for search. */
export function isCmdK(event: KeyboardEventLike): boolean {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
}

export function isEscape(event: KeyboardEventLike): boolean {
  return event.key === 'Escape';
}

/**
 * Move focus to the first focusable element inside a container. Returns false
 * if nothing focusable was found.
 */
export function focusFirst(container: HTMLElement | null | undefined): boolean {
  if (!container) return false;
  const focusable = getFocusable(container);
  const first = focusable[0];
  if (first instanceof HTMLElement) {
    first.focus();
    return true;
  }
  container.focus();
  return true;
}

/**
 * Wrap-around focus trap for modal/drawer containers. Call on Tab keydown.
 * Returns true when the event was handled (focus wrapped).
 */
export function trapTab(
  container: HTMLElement | null | undefined,
  event: KeyboardEvent
): boolean {
  if (!container) return false;
  const focusable = getFocusable(container);
  if (focusable.length === 0) return false;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey) {
    if (
      active === first ||
      active === container ||
      !container.contains(active) ||
      first === undefined
    ) {
      event.preventDefault();
      last?.focus();
      return true;
    }
  } else {
    if (
      active === last ||
      !container.contains(active) ||
      last === undefined
    ) {
      event.preventDefault();
      first?.focus();
      return true;
    }
  }
  return false;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'details > summary'
  ].join(',');
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}