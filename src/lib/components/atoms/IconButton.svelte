<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface IconButtonProps {
    /** Required: describes the action for screen readers. */
    label: string;
    href?: string;
    variant?: 'ghost' | 'secondary';
    size?: 'sm' | 'md';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let {
    label,
    href,
    variant = 'ghost',
    size = 'md',
    disabled = false,
    type = 'button',
    children,
    ...rest
  }: IconButtonProps = $props();

  const base =
    'inline-flex items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none min-w-11 min-h-11';
  const variants = {
    ghost: 'text-text-muted hover:text-text hover:bg-surface',
    secondary: 'bg-surface text-text border border-border hover:border-accent'
  };
  const sizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11'
  };

  const classes = $derived(cn(base, variants[variant], sizes[size]));
</script>

{#if href}
  <a {href} class={classes} aria-label={label} data-sveltekit-preload-data="hover" {...rest}>
    {@render children?.()}
  </a>
{:else}
  <button {type} {disabled} class={classes} aria-label={label} {...rest}>
    {@render children?.()}
  </button>
{/if}