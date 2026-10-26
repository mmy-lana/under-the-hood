<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ArrowRight, FileSearch, Search } from '@lucide/svelte';
  import type { RangeTuple } from 'fuse.js';
  import { cn } from '$lib/utils/cn';
  import { search, type SearchHit } from '$lib/stores/search.svelte';
  import type { SearchRecord } from '$lib/types/index';
  import { focusFirst, trapTab } from '$lib/utils/keyboard';

  interface SearchPaletteProps {
    open: boolean;
    onclose: () => void;
    index: SearchRecord[];
  }

  let { open, onclose, index }: SearchPaletteProps = $props();

  let query = $state('');
  let activeIndex = $state(0);
  let dialogEl = $state<HTMLDivElement | null>(null);
  let inputEl = $state<HTMLInputElement | null>(null);
  let listEl = $state<HTMLUListElement | null>(null);
  let previouslyFocused: HTMLElement | null = null;

  const results = $derived(search(query, index));

  function reset(): void {
    query = '';
    activeIndex = 0;
  }

  function announceOpen(): void {
    reset();
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const shell = document.getElementById('app-shell');
    shell?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    // Defer so the dialog is in the DOM and the input can receive focus.
    requestAnimationFrame(() => {
      inputEl?.focus();
    });
  }

  function announceClose(): void {
    const shell = document.getElementById('app-shell');
    shell?.removeAttribute('inert');
    document.body.style.overflow = '';
    previouslyFocused?.focus();
    previouslyFocused = null;
  }

  $effect(() => {
    if (open) {
      announceOpen();
    } else {
      announceClose();
    }
  });

  function clampIndex(next: number, length: number): number {
    if (length === 0) return 0;
    return (next + length) % length;
  }

  function scrollActiveIntoView(): void {
    const el = listEl?.querySelector<HTMLElement>(`#search-option-${activeIndex}`);
    el?.scrollIntoView({ block: 'nearest' });
  }

  function selectHit(hit: SearchHit): void {
    onclose();
    goto(hit.item.href);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onclose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = clampIndex(activeIndex + 1, results.length);
      scrollActiveIntoView();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = clampIndex(activeIndex - 1, results.length);
      scrollActiveIntoView();
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      activeIndex = 0;
      scrollActiveIntoView();
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      activeIndex = results.length > 0 ? results.length - 1 : 0;
      scrollActiveIntoView();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const hit = results[activeIndex];
      if (hit) selectHit(hit);
      return;
    }
    if (event.key === 'Tab') {
      trapTab(dialogEl, event);
    }
  }

  /**
   * Escape HTML metacharacters in build-time content before it is embedded in
   * the `<mark>`-annotated string consumed by `{@html}` (BUG-001). Content is
   * repo-authored, but titles legitimately contain `<…>` tokens (e.g.
   * `ManuallyDrop<T>`); without escaping, `{@html}` would parse them as real
   * elements (corrupting the rendered title) and would also be an HTML
   * injection sink if content ever comes from an untrusted contributor.
   */
  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Wrap Fuse match ranges (inclusive end) in <mark>. Escaped build-time text. */
  function markedTitle(hit: SearchHit): string {
    const text = hit.item.title;
    const ranges = hit.matches
      .filter((m) => m.key === 'title')
      .flatMap((m) => m.indices);
    if (ranges.length === 0) return escapeHtml(text);
    let out = '';
    let cursor = 0;
    for (const [start, end] of ranges as RangeTuple[]) {
      const safeStart = Math.max(cursor, start);
      if (safeStart > cursor) out += escapeHtml(text.slice(cursor, safeStart));
      out += `<mark>${escapeHtml(text.slice(safeStart, end + 1))}</mark>`;
      cursor = end + 1;
    }
    out += escapeHtml(text.slice(cursor));
    return out;
  }

  function markedPath(hit: SearchHit): string {
    const path = `${hit.item.category} / ${hit.item.subcategory} / ${hit.item.id}`;
    const ranges = hit.matches
      .filter((m) => m.key === 'subcategory' || m.key === 'category')
      .flatMap((m) => m.indices);
    if (ranges.length === 0) return escapeHtml(path);
    let out = '';
    let cursor = 0;
    for (const [start, end] of ranges as RangeTuple[]) {
      const safeStart = Math.max(cursor, start);
      if (safeStart > cursor) out += escapeHtml(path.slice(cursor, safeStart));
      out += `<mark>${escapeHtml(path.slice(safeStart, end + 1))}</mark>`;
      cursor = end + 1;
    }
    out += escapeHtml(path.slice(cursor));
    return out;
  }

  onMount(() => {
    if (!open) return;
    const shell = document.getElementById('app-shell');
    shell?.setAttribute('inert', '');
    focusFirst(dialogEl);
    requestAnimationFrame(() => inputEl?.focus());
    return () => {
      shell?.removeAttribute('inert');
    };
  });
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
      aria-labelledby="search-palette-title"
      tabindex="-1"
      class="flex h-dvh w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:h-auto sm:max-h-[80vh] sm:max-w-xl sm:rounded-xl"
      onkeydown={onKeydown}
    >
      <div class="border-b border-border p-4">
        <h2 id="search-palette-title" class="sr-only">
          Search topics
        </h2>
        <div class="flex items-center gap-2">
          <Search class="h-5 w-5 shrink-0 text-text-muted" aria-hidden="true" />
          <input
            bind:this={inputEl}
            bind:value={query}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-palette-list"
            aria-activedescendant={activeIndex < results.length ? `search-option-${activeIndex}` : undefined}
            aria-autocomplete="list"
            autocomplete="off"
            spellcheck="false"
            placeholder="Search topics, tags, frameworks…"
            class="w-full bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
          />
          <button
            type="button"
            onclick={onclose}
            class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="Close search"
          >
            <kbd class="rounded border border-border bg-canvas px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>
          </button>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain" role="presentation">
        {#if results.length === 0}
          <div class="flex flex-col items-center gap-2 px-6 py-10 text-center" aria-live="polite">
            <FileSearch class="h-8 w-8 text-text-muted" aria-hidden="true" />
            <p class="text-sm text-text-muted">No topics match “{query.trim()}”.</p>
            <p class="text-xs text-text-muted">Try a framework, a category, or a keyword like “signals”.</p>
          </div>
        {:else}
          <ul id="search-palette-list" role="listbox" aria-label="Search results" bind:this={listEl}>
            {#each results as hit, i (hit.item.id)}
              {@const active = i === activeIndex}
              <li role="none">
                <a
                  id={`search-option-${i}`}
                  role="option"
                  aria-selected={active}
                  href={hit.item.href}
                  class={cn(
                    'flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                    active ? 'bg-accent/10' : 'hover:bg-canvas'
                  )}
                  onclick={() => onclose()}
                >
                  <span class="flex items-center justify-between gap-2">
                    <span class="min-w-0 truncate text-sm font-medium text-text" aria-hidden="false">
                      {@html markedTitle(hit)}
                    </span>
                    {#if active}
                      <ArrowRight class="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {/if}
                  </span>
                  <span class="flex items-center justify-between gap-2">
                    <span class="min-w-0 truncate font-mono text-[11px] text-text-muted">
                      {@html markedPath(hit)}
                    </span>
                    <span class="flex shrink-0 gap-1">
                      {#each hit.item.tags.slice(0, 2) as tag (tag)}
                        <span class="rounded-full bg-surface px-1.5 py-0.5 text-[10px] text-text-muted border border-border">
                          {tag}
                        </span>
                      {/each}
                    </span>
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-text-muted">
        <span aria-live="polite">{results.length} {results.length === 1 ? 'result' : 'results'}</span>
        <span class="hidden sm:flex items-center gap-3">
          <span><kbd class="rounded border border-border bg-canvas px-1 font-mono">↑↓</kbd> navigate</span>
          <span><kbd class="rounded border border-border bg-canvas px-1 font-mono">↵</kbd> open</span>
        </span>
      </div>
    </div>
  </div>
{/if}