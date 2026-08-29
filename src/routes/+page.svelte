<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { ArrowRight, CalendarClock, ChevronRight, Layers, Tag } from '@lucide/svelte';
  import Badge from '$lib/components/atoms/Badge.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import type { HomeData } from './+page.server';

  let { data }: { data: HomeData } = $props();

  const categoryOrder = ['frontend', 'backend'] as const;
  const CATEGORY_LABELS: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend'
  };

  function formatDate(value: string): string {
    const [year, month, day] = value.split('-').map((p) => Number(p));
    if (!year || !month || !day) return value;
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(year, month - 1, day));
  }

  // url.searchParams is forbidden during prerender; read it only in
  // the browser. The $derived re-runs whenever page.url changes, so
  // client-side reactivity is preserved.
  function urlParam(key: string): string {
    if (!browser) return '';
    return page.url.searchParams.get(key) ?? '';
  }

  const urlFilter = $derived(urlParam('filter'));
  const urlTag = $derived(urlParam('tag'));

  const subcategoryNames = $derived(
    Object.keys(data.topicsBySubcategory).sort((a, b) => {
      const catA = data.topicsBySubcategory[a]?.[0]?.category ?? 'frontend';
      const catB = data.topicsBySubcategory[b]?.[0]?.category ?? 'frontend';
      if (catA !== catB) {
        return categoryOrder.indexOf(catA) - categoryOrder.indexOf(catB);
      }
      return a.localeCompare(b);
    })
  );

  const allTags = $derived(Array.from(new Set(data.allTopics.flatMap((t) => t.tags))).sort());

  const visibleTopics = $derived(
    data.allTopics.filter((t) => {
      const matchFilter = urlFilter === '' || t.subcategory === urlFilter;
      const matchTag = urlTag === '' || t.tags.includes(urlTag);
      return matchFilter && matchTag;
    })
  );

  const recentTopics = $derived(data.allTopics.slice(0, 5));

  function topicCount(subcategory: string): number {
    return data.topicsBySubcategory[subcategory]?.length ?? 0;
  }

  function setTag(tag: string): void {
    const url = new URL(page.url);
    if (url.searchParams.get('tag') === tag) {
      url.searchParams.delete('tag');
    } else {
      url.searchParams.set('tag', tag);
    }
    goto(url.href, { keepFocus: true, noScroll: true, replaceState: true });
  }
</script>

<svelte:head>
  <title>Under The Hood — multi-depth technical interview hub</title>
  <meta
    name="description"
    content="A distraction-free, multi-depth technical learning and interview hub for frontend and backend concepts — ELI5 to under-the-hood mechanics."
  />
</svelte:head>

<!-- Hero -->
<section class="px-1 pb-8 sm:pb-12" aria-labelledby="hero-title">
  <div class="max-w-3xl">
    <h1 id="hero-title" class="text-balance text-3xl font-bold tracking-tight text-text sm:text-4xl">
      <span translate="no">Under The Hood</span>
    </h1>
    <p class="mt-3 text-base leading-relaxed text-text-muted sm:text-lg">
      Every topic is explained at four depths — an ELI5 metaphor, a practical
      junior walkthrough, a senior architectural view, and the real
      under-the-hood mechanics. No fluff, no videos, just the machinery.
    </p>
    <div class="mt-6 flex flex-wrap gap-3">
      <Button href="/#frontend" variant="primary">
        Browse frontend
        <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button href="/#backend" variant="secondary">
        Browse backend
        <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
    <p class="mt-4 text-sm text-text-muted">
      {data.allTopics.length} topics · press
      <kbd class="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">⌘&nbsp;K</kbd>
      to search.
    </p>
  </div>
</section>

<!-- Framework / concept grid -->
<section aria-labelledby="grid-title">
  <div class="flex items-center gap-2">
    <Layers class="h-5 w-5 text-accent" aria-hidden="true" />
    <h2 id="grid-title" class="text-balance text-xl font-bold text-text sm:text-2xl">
      Topic library
    </h2>
  </div>
  <p class="mt-1 text-sm text-text-muted">
    {#if urlFilter || urlTag}
      Showing {visibleTopics.length} of {data.allTopics.length} topics.
      <a href="/" class="font-medium text-accent underline-offset-2 hover:underline">Clear filters</a>
    {:else}
      Grouped by framework and stack.
    {/if}
  </p>

  {#each categoryOrder as category (category)}
    <h3 id={category} class="mt-8 scroll-mt-24 text-lg font-semibold text-text">
      {CATEGORY_LABELS[category]}
    </h3>
    <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {#each subcategoryNames.filter(
        (name) => data.topicsBySubcategory[name]?.[0]?.category === category
      ) as name (name)}
        {@const topics = data.topicsBySubcategory[name] ?? []}
        <article
          class:ring-2={urlFilter === name}
          class:ring-accent={urlFilter === name}
          class="flex flex-col rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/60"
        >
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-mono text-base font-semibold text-text" translate="no">{name}</h4>
            <Badge label={`${topicCount(name)} topics`} tone="neutral" />
          </div>
          <ul class="mt-3 flex flex-1 flex-col gap-0.5">
            {#each topics as topic (topic.id)}
              <li>
                <a
                  href={`/${topic.category}/${topic.subcategory}/${topic.id}/`}
                  class="group flex min-h-11 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted transition-colors hover:bg-canvas hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                  data-sveltekit-preload-data="hover"
                >
                  <span class="min-w-0 truncate">{topic.title}</span>
                  <ChevronRight
                    class="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </a>
              </li>
            {/each}
          </ul>
        </article>
      {/each}
    </div>
  {/each}
</section>

<!-- Concept matrix -->
<section class="mt-10" aria-labelledby="matrix-title">
  <div class="flex items-center gap-2">
    <Tag class="h-5 w-5 text-accent" aria-hidden="true" />
    <h2 id="matrix-title" class="text-balance text-xl font-bold text-text sm:text-2xl">
      Concept matrix
    </h2>
  </div>
  <p class="mt-1 text-sm text-text-muted">
    Filter the library by concept — click a chip to toggle it.
  </p>
  <div class="mt-3 flex flex-wrap gap-2">
    {#each allTags as tag (tag)}
      <button
        type="button"
        class:bg-accent={urlTag === tag}
        class:text-canvas={urlTag === tag}
        class="min-h-11 rounded-full border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        aria-pressed={urlTag === tag}
        onclick={() => setTag(tag)}
      >
        {tag}
      </button>
    {/each}
  </div>
</section>

<!-- Recent updates -->
<section class="mt-10" aria-labelledby="recent-title">
  <div class="flex items-center gap-2">
    <CalendarClock class="h-5 w-5 text-accent" aria-hidden="true" />
    <h2 id="recent-title" class="text-balance text-xl font-bold text-text sm:text-2xl">
      Recent updates
    </h2>
  </div>
  <ul class="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">
    {#each recentTopics as topic (topic.id)}
      <li>
        <a
          href={`/${topic.category}/${topic.subcategory}/${topic.id}/`}
          class="flex min-h-11 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          data-sveltekit-preload-data="hover"
        >
          <span class="min-w-0 flex-1 truncate text-text">{topic.title}</span>
          <Badge label={topic.subcategory} tone="accent" />
          <time datetime={topic.lastUpdated} class="shrink-0 font-mono text-xs text-text-muted">
            {formatDate(topic.lastUpdated)}
          </time>
        </a>
      </li>
    {/each}
  </ul>
</section>