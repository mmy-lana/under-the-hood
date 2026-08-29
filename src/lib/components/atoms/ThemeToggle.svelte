<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { getTheme, setTheme } from '$lib/stores/theme.svelte';
  import type { ThemeName } from '$lib/types';

  const THEMES: Array<{ value: ThemeName; label: string; icon: string }> = [
    { value: 'paper', label: 'Paper', icon: '📜' },
    { value: 'obsidian', label: 'Obsidian', icon: '🌙' },
    { value: 'studio', label: 'Studio', icon: '☀️' }
  ];

  /** Guaranteed-defined theme lookup by offset from the current theme.
    * `getTheme()` is reactive inside `$derived` per the store contract, so the
    * mobile button's active/next labels update on toggle. The `?? { ... }`
    * fallback satisfies `noUncheckedIndexedAccess` without a non-null assertion
    * (the fallback is unreachable because THEMES has 3 entries and the modulo
    * keeps the index in [0,2]). */
  function themeByOffset(current: ThemeName, offset: number) {
    const idx = THEMES.findIndex((t) => t.value === current);
    const safe = idx < 0 ? 0 : idx;
    return THEMES[(safe + offset) % THEMES.length] ?? {
      value: 'paper' as ThemeName,
      label: 'Paper',
      icon: '📜'
    };
  }

  const activeTheme = $derived(themeByOffset(getTheme(), 0));
  const nextTheme = $derived(themeByOffset(getTheme(), 1));
</script>

<div
  class="hidden sm:inline-flex items-center rounded-md border border-border bg-surface p-1"
  role="group"
  aria-label="Theme"
>
  {#each THEMES as t (t.value)}
    <button
      type="button"
      class={cn(
        'min-h-11 rounded px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
        getTheme() === t.value
          ? 'bg-accent text-canvas'
          : 'text-text-muted hover:text-text hover:bg-canvas'
      )}
      aria-pressed={getTheme() === t.value}
      aria-label={`${t.label} theme`}
      onclick={() => setTheme(t.value)}
    >
      <span class="translate-none">{t.label}</span>
    </button>
  {/each}
</div>

<button
  type="button"
  class="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text sm:hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
  aria-label={`Theme: ${activeTheme.label}. Switch to ${nextTheme.label}.`}
  onclick={() => setTheme(nextTheme.value)}
>
  <span class="translate-none" aria-hidden="true">{activeTheme.icon}</span>
  <span class="translate-none">{activeTheme.label}</span>
</button>