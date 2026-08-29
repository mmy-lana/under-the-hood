<script lang="ts">
  import type { ProgressiveDepth } from '$lib/content/schema';
  import type { DepthTier } from '$lib/types';

  interface ProgressiveReaderProps {
    depths: ProgressiveDepth;
    active: DepthTier;
  }

  let { depths, active }: ProgressiveReaderProps = $props();

  const LABELS: Record<DepthTier, string> = {
    eli5: 'Explain it like I am five',
    junior: 'The practical view',
    senior: 'The architectural view',
    underTheHood: 'Under the hood'
  };
</script>

<article class="rounded-xl border border-border bg-surface p-4 sm:p-6" aria-live="polite">
  <header class="mb-3">
    <p class="text-xs font-bold uppercase tracking-wider text-accent">
      {LABELS[active]}
    </p>
  </header>
  <div class="reading-prose text-base leading-relaxed text-text">
    {#if active === 'eli5'}
      <p>{depths.eli5}</p>
    {:else if active === 'junior'}
      <p>{depths.junior}</p>
    {:else if active === 'senior'}
      <p>{depths.senior}</p>
    {:else}
      <p>{depths.underTheHood}</p>
    {/if}
  </div>
</article>