<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import CopyButton from '$lib/components/atoms/CopyButton.svelte';
  import type { HighlightedCode } from '$lib/types';

  interface RosettaTabsProps {
    rosetta: Record<string, HighlightedCode>;
  }

  let { rosetta }: RosettaTabsProps = $props();

  const frameworks = $derived(Object.keys(rosetta));

  let active = $state<string>('');

  $effect(() => {
    if (!frameworks.includes(active)) {
      const first = frameworks[0];
      if (first) active = first;
    }
  });

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const idx = frameworks.indexOf(active);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = frameworks[(idx + delta + frameworks.length) % frameworks.length];
    if (next) active = next;
  }
</script>

{#if frameworks.length > 0}
  <section class="rounded-xl border border-border bg-surface">
    <div
      role="tablist"
      aria-label="Framework equivalents"
      tabindex="0"
      class="flex overflow-x-auto border-b border-border"
      onkeydown={onKeydown}
    >
      {#each frameworks as fw (fw)}
        <button
          type="button"
          role="tab"
          id={`rosetta-tab-${fw}`}
          aria-selected={active === fw}
          aria-controls={`rosetta-panel-${fw}`}
          tabindex={active === fw ? 0 : -1}
          class={cn(
            'min-h-11 whitespace-nowrap px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
            active === fw
              ? 'border-b-2 border-accent text-accent'
              : 'border-b-2 border-transparent text-text-muted hover:text-text'
          )}
          onclick={() => (active = fw)}
        >
          <span class="translate-none">{fw}</span>
        </button>
      {/each}
    </div>

    {#each frameworks as fw (fw)}
      {@const entry = rosetta[fw]}
      <div
        role="tabpanel"
        id={`rosetta-panel-${fw}`}
        aria-labelledby={`rosetta-tab-${fw}`}
        hidden={active !== fw}
        tabindex="0"
        class="min-w-0 max-w-full overflow-hidden p-2 sm:p-3"
      >
        {#if entry}
          <div class="mb-2 flex items-center justify-between gap-2 pl-2">
            <span class="font-mono text-xs text-text-muted" translate="no">
              {fw} equivalent
            </span>
            <CopyButton code={entry.code} label="Copy code" variant="dark" />
          </div>
          <div class="code-block overflow-x-auto rounded-md text-sm">
            {@html entry.html}
          </div>
        {/if}
      </div>
    {/each}
  </section>
{/if}