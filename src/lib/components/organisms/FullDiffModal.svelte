<script lang="ts">
  import { X } from '@lucide/svelte';
  import { cn } from '$lib/utils/cn';
  import CopyButton from '$lib/components/atoms/CopyButton.svelte';
  import type { DiffPaneData } from '$lib/types';
  import { trapTab } from '$lib/utils/keyboard';

  interface FullDiffModalProps {
    open: boolean;
    onclose: () => void;
    legacy: DiffPaneData;
    modern: DiffPaneData;
  }

  let { open, onclose, legacy, modern }: FullDiffModalProps = $props();

  let dialogEl = $state<HTMLDivElement | null>(null);
  let legacyPaneEl = $state<HTMLDivElement | null>(null);
  let modernPaneEl = $state<HTMLDivElement | null>(null);
  let previouslyFocused: HTMLElement | null = null;

  let syncing = $state(false);

  $effect(() => {
    if (open) {
      previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        dialogEl?.querySelector<HTMLElement>('button')?.focus();
      });
      return () => {
        document.body.style.overflow = '';
        previouslyFocused?.focus();
        previouslyFocused = null;
      };
    }
  });

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onclose();
      return;
    }
    if (event.key === 'Tab') {
      trapTab(dialogEl, event);
    }
  }

  /** Ratio-synced vertical scroll for the desktop two-column layout. */
  function syncScroll(from: HTMLDivElement | null, to: HTMLDivElement | null): void {
    if (!from || !to || syncing) return;
    syncing = true;
    const maxFrom = from.scrollHeight - from.clientHeight;
    const maxTo = to.scrollHeight - to.clientHeight;
    if (maxFrom > 0 && maxTo > 0) {
      to.scrollTop = (from.scrollTop / maxFrom) * maxTo;
    }
    requestAnimationFrame(() => {
      syncing = false;
    });
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
    role="presentation"
    onclick={(e) => {
      if (e.target === e.currentTarget) onclose();
    }}
  >
    <div
      bind:this={dialogEl}
      role="dialog"
      aria-modal="true"
      aria-labelledby="full-diff-title"
      tabindex="-1"
      class="flex h-[88vh] max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-xl sm:max-w-6xl"
      onkeydown={onKeydown}
    >
      <div class="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 id="full-diff-title" class="min-w-0 truncate text-sm font-semibold text-text sm:text-base">
          Full comparison
        </h2>
        <button
          type="button"
          onclick={onclose}
          class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          aria-label="Close comparison"
        >
          <X class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col">
        <!-- <1024px: stacked vertical comparison (Top Legacy → Bottom Modern).
             Body scrolls vertically; each code pane scrolls horizontally. -->
        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 space-y-3 lg:hidden">
          <div class="flex flex-col overflow-hidden rounded-lg border border-border">
            {@render PaneHeader(legacy, 'legacy')}
            <div class="diff-pane-legacy code-block overflow-x-auto text-sm">
              {@html legacy.html}
            </div>
          </div>
          <div class="flex flex-col overflow-hidden rounded-lg border border-border">
            {@render PaneHeader(modern, 'modern')}
            <div class="diff-pane-modern code-block overflow-x-auto text-sm">
              {@html modern.html}
            </div>
          </div>
        </div>

        <!-- >=1024px: side-by-side with ratio-synced scroll (unchanged behavior) -->
        <div class="hidden min-h-0 flex-1 grid grid-cols-2 h-full lg:grid">
          <div class="flex min-h-0 min-w-0 flex-col border-r border-border">
            {@render PaneHeader(legacy, 'legacy')}
            <div
              bind:this={legacyPaneEl}
              class="diff-pane-legacy code-block min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain text-sm"
              onscroll={() => syncScroll(legacyPaneEl, modernPaneEl)}
            >
              {@html legacy.html}
            </div>
          </div>
          <div class="flex min-h-0 min-w-0 flex-col">
            {@render PaneHeader(modern, 'modern')}
            <div
              bind:this={modernPaneEl}
              class="diff-pane-modern code-block min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain text-sm"
              onscroll={() => syncScroll(modernPaneEl, legacyPaneEl)}
            >
              {@html modern.html}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#snippet PaneHeader(pane: DiffPaneData, tint: 'legacy' | 'modern')}
  <div class="flex items-center justify-between gap-2 border-b border-border bg-canvas px-3 py-2">
    <span class="flex min-w-0 items-center gap-2">
      <span
        class={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap',
          tint === 'legacy'
            ? 'bg-[rgba(248,81,73,0.15)] text-red-600 dark:text-red-400'
            : 'bg-[rgba(63,185,80,0.15)] text-green-600 dark:text-green-400'
        )}
        translate="no"
      >
        {pane.label}
      </span>
      <span class="truncate font-mono text-xs text-text" translate="no">{pane.filename}</span>
      <span class="hidden rounded-full border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-muted sm:inline" translate="no">
        {pane.language}
      </span>
    </span>
    <CopyButton code={pane.code} label="Copy file" variant="dark" />
  </div>
{/snippet}