<script lang="ts">
  import { Check, Copy } from '@lucide/svelte';
  import { cn } from '$lib/utils/cn';

  interface CopyButtonProps {
    code: string;
    label?: string;
    variant?: 'dark' | 'default';
  }

  let { code, label = 'Copy code', variant = 'dark' }: CopyButtonProps = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined = $state(undefined);

  const variants = {
    dark: 'text-slate-300 hover:text-white hover:bg-white/10 border border-white/15',
    default:
      'text-text-muted hover:text-text hover:bg-surface border border-border'
  };

  async function onCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard API can be unavailable in non-secure contexts; fall back to execCommand.
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    copied = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      copied = false;
      timer = undefined;
    }, 2000);
  }
</script>

<div class="relative">
  <button
    type="button"
    class={cn(
      'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
      variants[variant]
    )}
    onclick={onCopy}
    aria-label={copied ? 'Copied to clipboard' : label}
  >
    {#if copied}
      <Check class="h-4 w-4" aria-hidden="true" />
    {:else}
      <Copy class="h-4 w-4" aria-hidden="true" />
    {/if}
    <span class="hidden sm:inline">{copied ? 'Copied' : label}</span>
  </button>
  <span class="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>
</div>