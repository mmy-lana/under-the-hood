import { browser } from '$app/environment';
import type { ThemeName } from '$lib/types';

/**
 * Theme store (runes). Persists to localStorage under `uth-theme` and keeps the
 * <html data-theme> attribute + <meta name="theme-color"> in sync. The inline
 * head script in app.html handles first paint (no FOUC); this store handles
 * every subsequent toggle. Prerendered HTML always emits the default 'paper'.
 *
 * Svelte forbids exporting a $state binding that is reassigned, so the state
 * stays module-internal and is read through getTheme() (a function call that
 * remains reactive wherever it is evaluated inside a template or $derived).
 */

const STORAGE_KEY = 'uth-theme';

const THEME_COLORS: Record<ThemeName, string> = {
  paper: '#F7F2E8',
  obsidian: '#0F172A',
  studio: '#FAFAFA'
};

const COLOR_SCHEME: Record<ThemeName, 'light' | 'dark'> = {
  paper: 'light',
  obsidian: 'dark',
  studio: 'light'
};

function readStoredTheme(): ThemeName {
  if (!browser) return 'paper';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'paper' || stored === 'obsidian' || stored === 'studio') {
    return stored;
  }
  return 'paper';
}

let theme = $state<ThemeName>(readStoredTheme());

export function getTheme(): ThemeName {
  return theme;
}

export function setTheme(next: ThemeName): void {
  theme = next;
  if (!browser) return;
  window.localStorage.setItem(STORAGE_KEY, next);
  const el = document.documentElement;
  el.dataset.theme = next;
  el.style.colorScheme = COLOR_SCHEME[next];
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[next]);
}

export function isThemeName(value: string | null | undefined): value is ThemeName {
  return value === 'paper' || value === 'obsidian' || value === 'studio';
}