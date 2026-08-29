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

  /** Which file is shown in the <1024px tabbed layout. */
  let activeSide = $state<'legacy' | 'modern'>('legacy');

  let syncing = $state(false);

  $effect(() => {
    if (open) {
      activeSide = 'legacy';
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
      class="flex h-auto max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:max-h-[85vh] sm:max-w-6xl sm:rounded-xl"
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

      <!-- Mobile / tablet (<1024px): tabbed single pane -->
      <div class="flex border-b border-border lg:hidden" role="tablist" aria-label="Diff view">
        <button
          type="button"
          role="tab"
          aria-selected={activeSide === 'legacy'}
          aria-controls="diff-pane-legacy-tab"
          id="diff-tab-legacy"
          class={cn(
            'min-h-11 flex-1 px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
            activeSide === 'legacy'
              ? 'bg-[rgba(248,81,73,0.12)] text-red-600 dark:text-red-400'
              : 'text-text-muted hover:text-text'
          )}
          onclick={() => (activeSide = 'legacy')}
        >
          {legacy.label}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSide === 'modern'}
          aria-controls="diff-pane-modern-tab"
          id="diff-tab-modern"
          class={cn(
            'min-h-11 flex-1 px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
            activeSide === 'modern'
              ? 'bg-[rgba(63,185,80,0.12)] text-green-600 dark:text-green-400'
              : 'text-text-muted hover:text-text'
          )}
          onclick={() => (activeSide = 'modern')}
        >
          {modern.label}
        </button>
      </div>

      <div class="min-h-0 flex-1">
        <!-- <1024px pane -->
        <div class="h-full lg:hidden">
          {#if activeSide === 'legacy'}
            <div
              id="diff-pane-legacy-tab"
              role="tabpanel"
              aria-labelledby="diff-tab-legacy"
              class="flex h-full flex-col"
            >
              {@render PaneHeader(legacy, 'legacy')}
              <div class="diff-pane-legacy code-block min-h-0 flex-1 overflow-auto overscroll-contain text-sm">
                {@html legacy.html}
              </div>
            </div>
          {:else}
            <div
              id="diff-pane-modern-tab"
              role="tabpanel"
              aria-labelledby="diff-tab-modern"
              class="flex h-full flex-col"
            >
              {@render PaneHeader(modern, 'modern')}
              <div class="diff-pane-modern code-block min-h-0 flex-1 overflow-auto overscroll-contain text-sm">
                {@html modern.html}
              </div>
            </div>
          {/if}
        </div>

        <!-- >=1024px pane: side-by-side -->
        <div class="hidden h-full grid-cols-2 lg:grid">
          <div class="flex min-h-0 flex-col border-r border-border">
            {@render PaneHeader(legacy, 'legacy')}
            <div
              bind:this={legacyPaneEl}
              class="diff-pane-legacy code-block min-h-0 flex-1 overflow-auto overscroll-contain text-sm"
              onscroll={() => syncScroll(legacyPaneEl, modernPaneEl)}
            >
              {@html legacy.html}
            </div>
          </div>
          <div class="flex min-h-0 flex-col">
            {@render PaneHeader(modern, 'modern')}
            <div
              bind:this={modernPaneEl}
              class="diff-pane-modern code-block min-h-0 flex-1 overflow-auto overscroll-contain text-sm"
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
        class={cn('h-2 w-2 shrink-0 rounded-full', tint === 'legacy' ? 'bg-red-500' : 'bg-green-500')}
        aria-hidden="true"
      ></span>
      <span class="truncate font-mono text-xs text-text" translate="no">{pane.filename}</span>
      <span class="hidden rounded-full border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-muted sm:inline" translate="no">
        {pane.language}
      </span>
    </span>
    <CopyButton code={pane.code} label="Copy file" variant="dark" />
  </div>
{/snippet}