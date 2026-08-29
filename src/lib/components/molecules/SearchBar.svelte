<script lang="ts">
  import { Search } from '@lucide/svelte';

  interface SearchBarProps {
    onopen: () => void;
  }

  let { onopen }: SearchBarProps = $props();
</script>

<div class="relative">
  <button
    type="button"
    onclick={onopen}
    class="group flex w-full min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-text-muted transition-colors hover:border-accent hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    aria-label="Open search (Command K)"
  >
    <Search class="h-4 w-4 shrink-0" aria-hidden="true" />
    <span class="flex-1 truncate text-left" aria-hidden="true">Search…</span>
    <kbd
      class="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
      aria-hidden="true"
    >
      ⌘&nbsp;K
    </kbd>
  </button>
</div>