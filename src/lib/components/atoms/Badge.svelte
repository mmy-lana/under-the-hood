<script lang="ts">
  import type { Component } from 'svelte';
  import { cn } from '$lib/utils/cn';

  interface BadgeProps {
    label: string;
    tone?: 'neutral' | 'accent';
    icon?: Component;
    children?: import('svelte').Snippet;
  }

  let { label, tone = 'neutral', icon: Icon, children }: BadgeProps = $props();

  const tones = {
    neutral: 'bg-surface text-text-muted border border-border',
    accent: 'bg-accent/15 text-accent border border-accent/30'
  };
</script>

<span
  class={cn(
    'inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-normal',
    tones[tone]
  )}
>
  {#if Icon}
    <Icon class="h-3 w-3" aria-hidden="true" />
  {/if}
  <span class="min-w-0 break-words translate-none">{label}</span>
  {@render children?.()}
</span>