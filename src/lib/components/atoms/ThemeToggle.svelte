<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { theme, setTheme } from '$lib/stores/theme.svelte';
  import type { ThemeName } from '$lib/types';

  const THEMES: Array<{ value: ThemeName; label: string }> = [
    { value: 'paper', label: 'Paper' },
    { value: 'obsidian', label: 'Obsidian' },
    { value: 'studio', label: 'Studio' }
  ];
</script>

<div
  class="inline-flex items-center rounded-md border border-border bg-surface p-1"
  role="group"
  aria-label="Theme"
>
  {#each THEMES as t (t.value)}
    <button
      type="button"
      class={cn(
        'min-h-11 rounded px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
        theme === t.value
          ? 'bg-accent text-canvas'
          : 'text-text-muted hover:text-text hover:bg-canvas'
      )}
      aria-pressed={theme === t.value}
      aria-label={`${t.label} theme`}
      onclick={() => setTheme(t.value)}
    >
      <span class="translate-none">{t.label}</span>
    </button>
  {/each}
</div>