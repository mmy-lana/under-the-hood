<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md';
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    ariaLabel?: string;
    children?: import('svelte').Snippet;
    /** Anything else is forwarded to the underlying element. */
    [key: string]: unknown;
  }

  let {
    variant = 'primary',
    size = 'md',
    href,
    type = 'button',
    disabled = false,
    ariaLabel,
    children,
    ...rest
  }: ButtonProps = $props();

  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none min-h-11';
  const variants = {
    primary: 'bg-accent text-canvas hover:opacity-90 active:opacity-80',
    secondary:
      'bg-surface text-text border border-border hover:border-accent hover:text-accent',
    ghost: 'text-text-muted hover:text-text hover:bg-surface'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm'
  };

  const classes = $derived(cn(base, variants[variant], sizes[size]));
</script>

{#if href}
  <a
    {href}
    class={classes}
    aria-label={ariaLabel}
    data-sveltekit-preload-data="hover"
    {...rest}
  >
    {@render children?.()}
  </a>
{:else}
  <button {type} {disabled} class={classes} aria-label={ariaLabel} {...rest}>
    {@render children?.()}
  </button>
{/if}