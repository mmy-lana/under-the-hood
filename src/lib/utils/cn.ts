/**
 * Tiny class-merge helper. Filters falsy values and joins with a space —
 * keeps templates readable without pulling in a dependency.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}