<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { DepthTier } from '$lib/types';

  interface DepthPillProps {
    tier: DepthTier;
    active: boolean;
    onselect: (tier: DepthTier) => void;
  }

  let { tier, active, onselect }: DepthPillProps = $props();

  const LABELS: Record<DepthTier, { label: string; emoji: string }> = {
    eli5: { label: 'ELI5', emoji: '🌱' },
    junior: { label: 'Junior', emoji: '🛠️' },
    senior: { label: 'Senior', emoji: '🏗️' },
    underTheHood: { label: 'Under The Hood', emoji: '🔧' }
  };
</script>

<button
  type="button"
  class={cn(
    'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none',
    active
      ? 'bg-accent text-canvas'
      : 'bg-surface text-text-muted border border-border hover:text-text hover:border-accent'
  )}
  aria-pressed={active}
  onclick={() => onselect(tier)}
>
  <span aria-hidden="true">{LABELS[tier].emoji}</span>
  <span class="translate-none">{LABELS[tier].label}</span>
</button>