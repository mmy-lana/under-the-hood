<script lang="ts">
  import { X } from '@lucide/svelte';
  import { cn } from '$lib/utils/cn';
  import type { TopicSchema } from '$lib/content/schema';
  import { trapTab } from '$lib/utils/keyboard';

  interface SidebarToCProps {
    topics: TopicSchema[];
    activeId?: string;
    open: boolean;
    onclose: () => void;
  }

  let { topics, activeId, open, onclose }: SidebarToCProps = $props();

  let drawerEl = $state<HTMLElement | null>(null);
  let previouslyFocused: HTMLElement | null = null;

  const groups = $derived(
    (['frontend', 'backend'] as const)
      .map((category) => ({
        category,
        subcategories: Object.entries(
          topics
            .filter((t) => t.category === category)
            .reduce<Record<string, TopicSchema[]>>((acc, t) => {
              const list = acc[t.subcategory] ?? [];
              list.push(t);
              acc[t.subcategory] = list;
              return acc;
            }, {})
        ).sort((a, b) => a[0].localeCompare(b[0]))
      }))
      .filter((g) => g.subcategories.length > 0)
  );

  $effect(() => {
    if (open) {
      previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        drawerEl?.querySelector<HTMLElement>('a, button')?.focus();
      });
      return () => {
        document.body.style.overflow = '';
        previouslyFocused?.focus();
        previouslyFocused = null;
      };
    }
  });

  function onDrawerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onclose();
      return;
    }
    if (event.key === 'Tab') {
      trapTab(drawerEl, event);
    }
  }
</script>

{#snippet Tree()}
  {#each groups as group (group.category)}
    <div class="mb-4">
      <h3 class="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-text-muted">
        <a href={`/#${group.category}`} class="transition-colors hover:text-accent" data-sveltekit-preload-data="hover">
          {group.category}
        </a>
      </h3>
      {#each group.subcategories as [name, items] (name)}
        <div class="mb-2">
          <h4 class="px-3 pb-1 font-mono text-[11px] text-accent" translate="no">{name}</h4>
          <ul class="space-y-0.5">
            {#each items as topic (topic.id)}
              <li>
                <a
                  href={`/${topic.category}/${topic.subcategory}/${topic.id}/`}
                  aria-current={activeId === topic.id ? 'page' : undefined}
                  class={cn(
                    'block rounded-md px-3 py-2 text-sm leading-snug transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                    activeId === topic.id
                      ? 'bg-accent/10 font-medium text-accent'
                      : 'text-text-muted hover:bg-surface hover:text-text'
                  )}
                  data-sveltekit-preload-data="hover"
                >
                  {topic.title}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/each}
{/snippet}

<!-- Mobile / tablet: off-canvas drawer -->
{#if open}
  <div class="fixed inset-0 z-40 bg-black/50 xl:hidden" role="presentation" onclick={onclose}></div>
{/if}
<aside
  bind:this={drawerEl}
  class={cn(
    'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto overscroll-contain border-r border-border bg-surface shadow-2xl transition-transform xl:hidden',
    open ? 'translate-x-0' : '-translate-x-full'
  )}
  style="padding-bottom: env(safe-area-inset-bottom); padding-top: env(safe-area-inset-top)"
  aria-label="Table of contents"
  aria-hidden={!open}
  onkeydown={onDrawerKeydown}
>
  <div class="sticky top-0 flex items-center justify-between border-b border-border bg-surface px-3 py-2">
    <span class="text-sm font-semibold text-text">Topics</span>
    <button
      type="button"
      onclick={onclose}
      class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      aria-label="Close menu"
      tabindex={open ? 0 : -1}
    >
      <X class="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
  <div class="p-3">
    {@render Tree()}
  </div>
</aside>

<!-- Desktop: persistent sticky sidebar -->
<aside
  class="hidden xl:block"
  aria-label="Table of contents"
>
  <nav class="sticky top-[calc(var(--hdr-h)+1rem)] max-h-[calc(100dvh-var(--hdr-h)-2rem)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-3">
    {@render Tree()}
  </nav>
</aside>