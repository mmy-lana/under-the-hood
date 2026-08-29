import { browser } from '$app/environment';
import type { DepthTier } from '$lib/types';

/**
 * Depth store (runes). Controls which tier of ProgressiveReader is active.
 * Persists to localStorage (`uth-depth`) and mirrors the value into the URL
 * (`?depth=`) via history.replaceState so the state is deep-linkable.
 */

const STORAGE_KEY = 'uth-depth';

const DEPTH_TIERS: readonly DepthTier[] = ['eli5', 'junior', 'senior', 'underTheHood'];

function isDepthTier(value: string | null | undefined): value is DepthTier {
  return DEPTH_TIERS.some((t) => t === value);
}

function readStoredDepth(): DepthTier {
  if (!browser) return 'junior';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isDepthTier(stored)) return stored;
  return 'junior';
}

export let depth = $state<DepthTier>(readStoredDepth());

export function setDepth(next: DepthTier): void {
  depth = next;
  if (!browser) return;
  window.localStorage.setItem(STORAGE_KEY, next);
  const url = new URL(window.location.href);
  if (next === 'junior') {
    url.searchParams.delete('depth');
  } else {
    url.searchParams.set('depth', next);
  }
  window.history.replaceState({}, '', url);
}

/**
 * Initialize from ?depth= URL param (validated), falling back to the stored
 * value then the default. Called once per topic page on mount.
 */
export function initDepthFromUrl(): void {
  if (!browser) return;
  const param = new URL(window.location.href).searchParams.get('depth');
  if (isDepthTier(param)) {
    depth = param;
    window.localStorage.setItem(STORAGE_KEY, param);
  }
}

export function isDepthTierValue(value: string | null | undefined): value is DepthTier {
  return isDepthTier(value);
}

export { DEPTH_TIERS };