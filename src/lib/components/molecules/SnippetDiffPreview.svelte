<script lang="ts">
  import { ArrowRightLeft, Expand } from '@lucide/svelte';
  import CopyButton from '$lib/components/atoms/CopyButton.svelte';
  import type { DiffPaneData } from '$lib/types';

  interface SnippetDiffPreviewProps {
    title: string;
    summary: string;
    legacy: DiffPaneData;
    modern: DiffPaneData;
    onexpand: () => void;
  }

  let { title, summary, legacy, modern, onexpand }: SnippetDiffPreviewProps = $props();
</script>

<section class="rounded-xl border border-border bg-surface" aria-labelledby="snippet-diff-title">
  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
    <div class="min-w-0">
      <h3 id="snippet-diff-title" class="text-base font-semibold text-text">
        {title}
      </h3>
      <p class="text-sm text-text-muted">{summary}</p>
    </div>
    <span class="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas px-2.5 py-1 text-xs text-text-muted">
      <ArrowRightLeft class="h-3.5 w-3.5" aria-hidden="true" />
      before → after
    </span>
  </div>

  <div class="grid gap-0 lg:grid-cols-2">
    <div class="min-w-0 max-w-full overflow-hidden border-b border-border p-2 lg:border-b-0 lg:border-r">
      <div class="mb-2 flex items-center justify-between gap-2 pl-2">
        <span class="inline-flex items-center gap-2 font-mono text-xs text-text-muted">
          <span class="h-2 w-2 rounded-full bg-red-500" aria-hidden="true"></span>
          {legacy.label}
        </span>
        <CopyButton code={legacy.code} label="Copy snippet" variant="dark" />
      </div>
      <div class="diff-pane-legacy code-block overflow-x-auto rounded-md text-sm">
        {@html legacy.html}
      </div>
    </div>
    <div class="min-w-0 max-w-full overflow-hidden p-2">
      <div class="mb-2 flex items-center justify-between gap-2 pl-2">
        <span class="inline-flex items-center gap-2 font-mono text-xs text-text-muted">
          <span class="h-2 w-2 rounded-full bg-green-500" aria-hidden="true"></span>
          {modern.label}
        </span>
        <CopyButton code={modern.code} label="Copy snippet" variant="dark" />
      </div>
      <div class="diff-pane-modern code-block overflow-x-auto rounded-md text-sm">
        {@html modern.html}
      </div>
    </div>
  </div>

  <div class="border-t border-border p-3">
    <button
      type="button"
      onclick={onexpand}
      class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-canvas px-4 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none sm:w-auto"
    >
      <Expand class="h-4 w-4" aria-hidden="true" />
      Expand full comparison
    </button>
  </div>
</section>